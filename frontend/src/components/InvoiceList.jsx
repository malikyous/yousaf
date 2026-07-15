import { useEffect, useState } from 'react'
import { Eye, Trash2, FileText, Search } from 'lucide-react'
import axios from 'axios'

const InvoiceList = ({ invoices, refreshTrigger, onViewInvoice, onRefresh }) => {
  const [invoiceList, setInvoiceList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [refreshTrigger])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/invoices')
      setInvoiceList(response.data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`/api/invoices/${id}`)
        onRefresh()
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('Failed to delete invoice')
      }
    }
  }

  const filteredInvoices = invoiceList.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 text-center">
        <div className="text-white">Loading invoices...</div>
      </div>
    )
  }

  if (invoiceList.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 text-center">
        <FileText className="w-20 h-20 text-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No invoices yet</h3>
        <p className="text-blue-200">Create your first invoice to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">All Invoices</h2>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-blue-400">{invoice.invoice_number}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{invoice.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-400">
                  ${invoice.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewInvoice(invoice)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InvoiceList
