from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import qrcode
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os
from dotenv import load_dotenv
import pymysql

load_dotenv()

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'invoice_db')

# Create database if it doesn't exist
try:
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    connection.commit()
    cursor.close()
    connection.close()
except Exception as e:
    print(f"Warning: Could not create database: {e}")

app = Flask(__name__)
CORS(app)

# MySQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(200), nullable=False)
    customer_email = db.Column(db.String(200))
    customer_address = db.Column(db.Text)
    invoice_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax_rate = db.Column(db.Numeric(5, 2), default=0)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    notes = db.Column(db.Text)
    qr_code_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade='all, delete-orphan')

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()
    result = []
    for invoice in invoices:
        items = [{'id': item.id, 'description': item.description, 'quantity': item.quantity, 
                  'unit_price': float(item.unit_price), 'total': float(item.total)} 
                 for item in invoice.items]
        result.append({
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'customer_name': invoice.customer_name,
            'customer_email': invoice.customer_email,
            'customer_address': invoice.customer_address,
            'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
            'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
            'subtotal': float(invoice.subtotal),
            'tax_rate': float(invoice.tax_rate),
            'tax_amount': float(invoice.tax_amount),
            'total': float(invoice.total),
            'notes': invoice.notes,
            'items': items,
            'created_at': invoice.created_at.isoformat()
        })
    return jsonify(result)

@app.route('/api/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    items = [{'id': item.id, 'description': item.description, 'quantity': item.quantity, 
              'unit_price': float(item.unit_price), 'total': float(item.total)} 
             for item in invoice.items]
    result = {
        'id': invoice.id,
        'invoice_number': invoice.invoice_number,
        'customer_name': invoice.customer_name,
        'customer_email': invoice.customer_email,
        'customer_address': invoice.customer_address,
        'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
        'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
        'subtotal': float(invoice.subtotal),
        'tax_rate': float(invoice.tax_rate),
        'tax_amount': float(invoice.tax_amount),
        'total': float(invoice.total),
        'notes': invoice.notes,
        'qr_code_path': invoice.qr_code_path,
        'items': items,
        'created_at': invoice.created_at.isoformat()
    }
    return jsonify(result)

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    data = request.json
    
    # Generate invoice number
    invoice_count = Invoice.query.count()
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{invoice_count + 1:04d}"
    
    # Calculate totals
    subtotal = sum(item['quantity'] * item['unit_price'] for item in data['items'])
    tax_rate = data.get('tax_rate', 0)
    tax_amount = subtotal * (tax_rate / 100)
    total = subtotal + tax_amount
    
    # Create invoice
    invoice = Invoice(
        invoice_number=invoice_number,
        customer_name=data['customer_name'],
        customer_email=data.get('customer_email'),
        customer_address=data.get('customer_address'),
        invoice_date=datetime.strptime(data['invoice_date'], '%Y-%m-%d').date(),
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None,
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        total=total,
        notes=data.get('notes')
    )
    
    db.session.add(invoice)
    db.session.flush()
    
    # Add items
    for item_data in data['items']:
        item = InvoiceItem(
            invoice_id=invoice.id,
            description=item_data['description'],
            quantity=item_data['quantity'],
            unit_price=item_data['unit_price'],
            total=item_data['quantity'] * item_data['unit_price']
        )
        db.session.add(item)
    
    # Generate QR code
    qr_data = f"Invoice: {invoice_number}|Customer: {data['customer_name']}|Total: ${total:.2f}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # Ensure qr_codes directory exists
    qr_dir = os.path.join(os.path.dirname(__file__), 'qr_codes')
    os.makedirs(qr_dir, exist_ok=True)
    
    qr_path = os.path.join(qr_dir, f"{invoice_number}.png")
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_img.save(qr_path)
    
    invoice.qr_code_path = qr_path
    
    db.session.commit()
    
    return jsonify({'id': invoice.id, 'invoice_number': invoice_number}), 201

@app.route('/api/invoices/<int:invoice_id>/pdf', methods=['GET'])
def generate_pdf(invoice_id):
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        items = invoice.items
        
        # Create PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Background color (light gray header)
        p.setFillColorRGB(0.95, 0.95, 0.95)
        p.rect(0, height - 100, width, 100, fill=1, stroke=0)
        
        # Company header
        p.setFillColorRGB(0.2, 0.4, 0.8)
        p.setFont("Helvetica-Bold", 32)
        p.drawString(50, height - 60, "INVOICE")
        
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 90, "Professional Invoice System")
        
        # Invoice number and date on right side
        p.setFont("Helvetica-Bold", 12)
        p.drawString(400, height - 50, f"Invoice #: {invoice.invoice_number}")
        p.setFont("Helvetica", 11)
        p.drawString(400, height - 70, f"Date: {invoice.invoice_date.strftime('%B %d, %Y')}")
        if invoice.due_date:
            p.drawString(400, height - 90, f"Due: {invoice.due_date.strftime('%B %d, %Y')}")
        
        # Customer info section
        y = height - 140
        p.setFillColorRGB(0.9, 0.9, 0.9)
        p.rect(50, y - 60, width - 100, 60, fill=1, stroke=0)
        
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica-Bold", 12)
        p.drawString(60, y - 20, "BILL TO:")
        p.setFont("Helvetica", 11)
        p.drawString(60, y - 40, invoice.customer_name)
        if invoice.customer_email:
            p.drawString(60, y - 55, invoice.customer_email)
        
        if invoice.customer_address:
            p.setFont("Helvetica", 10)
            address_lines = invoice.customer_address.split('\n')
            for i, line in enumerate(address_lines[:2]):
                p.drawString(60, y - 70 - (i * 12), line)
        
        # Items table header
        y = height - 230
        p.setFillColorRGB(0.2, 0.4, 0.8)
        p.rect(50, y - 25, width - 100, 25, fill=1, stroke=0)
        
        p.setFillColorRGB(1, 1, 1)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(60, y - 17, "DESCRIPTION")
        p.drawString(350, y - 17, "QTY")
        p.drawString(420, y - 17, "UNIT PRICE")
        p.drawString(500, y - 17, "TOTAL")
        
        # Items
        y -= 30
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 10)
        
        for i, item in enumerate(items):
            # Alternate row colors
            if i % 2 == 0:
                p.setFillColorRGB(0.97, 0.97, 0.97)
                p.rect(50, y - 20, width - 100, 20, fill=1, stroke=0)
                p.setFillColorRGB(0, 0, 0)
            
            p.drawString(60, y - 12, item.description[:45])
            p.drawString(350, y - 12, str(item.quantity))
            p.drawString(420, y - 12, f"${float(item.unit_price):.2f}")
            p.drawString(500, y - 12, f"${float(item.total):.2f}")
            y -= 20
        
        # Totals section
        y -= 30
        p.setFillColorRGB(0.95, 0.95, 0.95)
        p.rect(350, y - 80, width - 400, 80, fill=1, stroke=0)
        
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 11)
        p.drawString(360, y - 15, f"Subtotal:")
        p.drawString(500, y - 15, f"${float(invoice.subtotal):.2f}")
        y -= 20
        
        if invoice.tax_rate > 0:
            p.drawString(360, y - 15, f"Tax ({invoice.tax_rate}%):")
            p.drawString(500, y - 15, f"${float(invoice.tax_amount):.2f}")
            y -= 20
        
        p.setFont("Helvetica-Bold", 13)
        p.setFillColorRGB(0.2, 0.4, 0.8)
        p.drawString(360, y - 15, "TOTAL:")
        p.drawString(500, y - 15, f"${float(invoice.total):.2f}")
        
        # Notes and terms
        y -= 50
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, y, "NOTES & TERMS:")
        p.setFont("Helvetica", 9)
        
        if invoice.notes:
            p.drawString(50, y - 15, invoice.notes[:80])
            y -= 30
        
        default_terms = "Thank you for your business! Payment is due within 30 days."
        p.drawString(50, y - 15, default_terms)
        
        # Footer
        p.setFillColorRGB(0.9, 0.9, 0.9)
        p.rect(0, 30, width, 30, fill=1, stroke=0)
        p.setFillColorRGB(0.5, 0.5, 0.5)
        p.setFont("Helvetica", 8)
        p.drawString(50, 45, "This is a computer-generated invoice. For questions, please contact our support team.")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f"{invoice.invoice_number}.pdf", mimetype='application/pdf')
    except Exception as e:
        print(f"PDF Generation Error: {e}")
        return jsonify({'error': 'Failed to generate PDF', 'details': str(e)}), 500

@app.route('/api/invoices/<int:invoice_id>/qr', methods=['GET'])
def get_qr_code(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    if invoice.qr_code_path and os.path.exists(invoice.qr_code_path):
        return send_file(invoice.qr_code_path, mimetype='image/png')
    return jsonify({'error': 'QR code not found'}), 404

@app.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    
    # Delete QR code file if exists
    if invoice.qr_code_path and os.path.exists(invoice.qr_code_path):
        os.remove(invoice.qr_code_path)
    
    db.session.delete(invoice)
    db.session.commit()
    
    return jsonify({'message': 'Invoice deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
