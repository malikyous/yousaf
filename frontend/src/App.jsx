import { useState, useEffect } from 'react'
import InvoiceForm from './components/InvoiceForm'
import InvoiceList from './components/InvoiceList'
import InvoiceView from './components/InvoiceView'
import { FileText, Plus, ShoppingCart, TrendingUp, Users, DollarSign } from 'lucide-react'

function App() {
  const [invoices, setInvoices] = useState([])
  const [currentView, setCurrentView] = useState('list')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshInvoices = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setCurrentView('view')
  }

  const handleCreateNew = () => {
    setSelectedInvoice(null)
    setCurrentView('form')
  }

  const handleInvoiceCreated = () => {
    refreshInvoices()
    setCurrentView('list')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Professional Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Professional Invoice System</h1>
                <p className="text-blue-200 text-sm">Enterprise-grade invoice management</p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Invoices</p>
                <p className="text-3xl font-bold text-white mt-1">{invoices.length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">
                  ${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Customers</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {new Set(invoices.map(inv => inv.customer_name)).size}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Growth</p>
                <p className="text-3xl font-bold text-white mt-1">+12%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {currentView === 'list' && (
          <InvoiceList
            invoices={invoices}
            refreshTrigger={refreshTrigger}
            onViewInvoice={handleViewInvoice}
            onRefresh={refreshInvoices}
          />
        )}
        {currentView === 'form' && (
          <InvoiceForm onInvoiceCreated={handleInvoiceCreated} onCancel={() => setCurrentView('list')} />
        )}
        {currentView === 'view' && selectedInvoice && (
          <InvoiceView
            invoice={selectedInvoice}
            onBack={() => setCurrentView('list')}
            onRefresh={refreshInvoices}
          />
        )}
      </main>
    </div>
  )
}

export default App
