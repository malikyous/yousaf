# AI Invoice Generator

A full-stack invoice management system with PDF generation, QR code support, and MySQL database storage.

## Features

- **Create Invoices**: Generate professional business invoices with customer details and line items
- **PDF Download**: Download invoices as professionally formatted PDF documents
- **QR Code Generation**: Automatic QR code generation for each invoice
- **MySQL Storage**: All invoice data stored securely in MySQL database
- **Modern UI**: Beautiful React + TailwindCSS frontend with intuitive interface
- **Invoice Management**: View, create, and delete invoices easily

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **PyMySQL** - MySQL database connector
- **ReportLab** - PDF generation
- **QRCode** - QR code generation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Database
- **MySQL** - Relational database

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MySQL Server 8.0 or higher

## Installation

### 1. Database Setup

```sql
-- Create database and tables
mysql -u root -p < database/schema.sql
```

Or manually execute the SQL in `database/schema.sql` in your MySQL client.

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials
```

Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=invoice_db
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend

```bash
cd backend
venv\Scripts\activate  # On Windows
python app.py
```

Backend will run on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click "New Invoice" to create a new invoice
3. Fill in customer information, invoice details, and line items
4. Click "Create Invoice" to save
5. View the invoice to download PDF or see QR code
6. Manage invoices from the main list

## API Endpoints

- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/pdf` - Download invoice as PDF
- `GET /api/invoices/:id/qr` - Get invoice QR code image

## Project Structure

```
AI invoice generator/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── qr_codes/           # Generated QR codes (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InvoiceForm.jsx    # Invoice creation form
│   │   │   ├── InvoiceList.jsx    # Invoice list view
│   │   │   └── InvoiceView.jsx    # Invoice detail view
│   │   ├── App.jsx         # Main application
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── database/
│   └── schema.sql          # Database schema
└── README.md
```

## Troubleshooting

### Database Connection Issues
- Ensure MySQL server is running
- Verify credentials in `.env` file
- Check that database `invoice_db` exists

### Frontend Build Issues
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 16 or higher

### PDF Generation Issues
- Ensure ReportLab is installed correctly
- Check file permissions for QR codes directory

## License

MIT License
