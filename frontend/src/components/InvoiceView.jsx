import { useState, useEffect } from 'react'
import { ArrowLeft, Download, QrCode, Trash2, Share2, Printer } from 'lucide-react'
import axios from 'axios'
import { config } from '../config'

const InvoiceView = ({ invoice, onBack, onRefresh }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [loadingQr, setLoadingQr] = useState(false)

  useEffect(() => {
    if (invoice) {
      fetchQrCode()
    }
  }, [invoice])

  const fetchQrCode = async () => {
    try {
      setLoadingQr(true)
      const response = await axios.get(`${config.apiUrl}/api/invoices/${invoice.id}/qr`, {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(response.data)
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error fetching QR code:', error)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/invoices/${invoice.id}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.invoice_number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`${config.apiUrl}/api/invoices/${invoice.id}`)
        onRefresh()
        onBack()
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('Failed to delete invoice')
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!invoice) return null

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Invoices
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            title="Print"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoice Details */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                    <Share2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">INVOICE</h1>
                    <p className="text-blue-400 font-semibold text-lg">{invoice.invoice_number}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/10 rounded-lg px-4 py-2 mb-2">
                  <p className="text-blue-200 text-sm">Date</p>
                  <p className="text-white font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                </div>
                {invoice.due_date && (
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <p className="text-blue-200 text-sm">Due Date</p>
                    <p className="text-white font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-blue-200 uppercase mb-3">Bill To</h3>
              <p className="font-bold text-white text-xl mb-1">{invoice.customer_name}</p>
              {invoice.customer_email && (
                <p className="text-blue-300 mb-2">{invoice.customer_email}</p>
              )}
              {invoice.customer_address && (
                <p className="text-gray-300 whitespace-pre-line">{invoice.customer_address}</p>
              )}
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 text-sm font-semibold text-blue-200 uppercase">Description</th>
                  <th className="text-center py-4 text-sm font-semibold text-blue-200 uppercase">Qty</th>
                  <th className="text-right py-4 text-sm font-semibold text-blue-200 uppercase">Price</th>
                  <th className="text-right py-4 text-sm font-semibold text-blue-200 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-white font-medium">{item.description}</td>
                    <td className="py-4 text-center text-blue-300">{item.quantity}</td>
                    <td className="py-4 text-right text-blue-300">${item.unit_price.toFixed(2)}</td>
                    <td className="py-4 text-right font-bold text-green-400">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
                <div className="flex justify-between py-3">
                  <span className="text-blue-200">Subtotal</span>
                  <span className="font-semibold text-white">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between py-3">
                    <span className="text-blue-200">Tax ({invoice.tax_rate}%)</span>
                    <span className="font-semibold text-white">${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-4 border-t border-white/20 font-bold text-2xl">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-blue-200 uppercase mb-3">Notes & Terms</h3>
                <p className="text-gray-300">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 sticky top-8">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              Invoice QR Code
            </h3>
            {loadingQr ? (
              <div className="flex items-center justify-center h-48 text-blue-200">
                Loading QR code...
              </div>
            ) : qrCodeUrl ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl mb-4 shadow-lg">
                  <img src={qrCodeUrl} alt="Invoice QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-blue-200 text-center mb-4">
                  Scan to verify invoice details
                </p>
                <div className="w-full bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-green-400 font-semibold text-sm">✓ Verified Invoice</p>
                  <p className="text-green-300 text-xs mt-1">Authentic & Valid</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-blue-200">
                QR code not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
