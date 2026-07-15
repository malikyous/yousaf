import { useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'
import axios from 'axios'
import { config } from '../config'

const InvoiceForm = ({ onInvoiceCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: 0,
    notes: ''
  })
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: 0 }])
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax_rate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.customer_name.trim()) {
      alert('Please enter customer name')
      return
    }
    
    const validItems = items.filter(item => item.description.trim() && item.quantity > 0 && item.unit_price > 0)
    if (validItems.length === 0) {
      alert('Please add at least one item with description, quantity, and price')
      return
    }
    
    setLoading(true)

    try {
      const response = await axios.post(`${config.apiUrl}/api/invoices`, {
        ...formData,
        items: validItems
      })
      onInvoiceCreated()
    } catch (error) {
      console.error('Error creating invoice:', error)
      const errorMessage = error.response?.data?.error || 'Failed to create invoice. Please try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Create New Invoice</h2>
          <p className="text-blue-200 mt-1">Fill in the details to generate a professional invoice</p>
        </div>
        <button onClick={onCancel} className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm">1</span>
            Customer Information
          </h3>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Customer Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-blue-200 mb-2">Address</label>
                <textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-sm">2</span>
            Invoice Details
          </h3>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Invoice Date *</label>
                <input
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-sm">3</span>
              Line Items
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 px-4 py-3 bg-white/10 rounded-lg text-right font-bold text-green-400">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-blue-200 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            placeholder="Payment terms, thank you notes, etc."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between mb-2">
            <span className="text-blue-200">Subtotal:</span>
            <span className="font-semibold text-white">${calculateSubtotal().toFixed(2)}</span>
          </div>
          {formData.tax_rate > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-blue-200">Tax ({formData.tax_rate}%):</span>
              <span className="font-semibold text-white">${calculateTax().toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold border-t border-white/20 pt-3">
            <span className="text-white">Total:</span>
            <span className="text-green-400">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default InvoiceForm
