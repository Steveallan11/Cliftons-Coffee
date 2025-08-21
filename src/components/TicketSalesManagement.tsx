import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Calendar as CalendarIcon, 
  Mail, 
  Phone, 
  Users, 
  DollarSign,
  Download,
  Filter,
  Eye,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ticketPurchaseService, TicketSale } from '@/utils/ticketPurchaseService'

interface TicketSalesManagementProps {
  darkMode?: boolean
}

interface TicketSaleWithEvent extends TicketSale {
  event_title?: string
  event_date?: string
}

const TicketSalesManagement: React.FC<TicketSalesManagementProps> = ({ darkMode = false }) => {
  const [ticketSales, setTicketSales] = useState<TicketSaleWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedTicketSale, setSelectedTicketSale] = useState<TicketSaleWithEvent | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    loadTicketSales()
  }, [])

  const loadTicketSales = async () => {
    try {
      setLoading(true)
      const result = await ticketPurchaseService.getTicketSales()
      
      if (result.success && result.data) {
        // TODO: In a real implementation, we'd join with events table
        // For now, we'll use mock event data
        const salesWithEvents = result.data.map(sale => ({
          ...sale,
          event_title: `Event #${sale.event_id}`, // This should be fetched from events table
          event_date: new Date().toISOString().split('T')[0] // Mock date
        }))
        setTicketSales(salesWithEvents)
      } else {
        toast.error(result.error || 'Failed to load ticket sales')
      }
    } catch (error: any) {
      console.error('Error loading ticket sales:', error)
      toast.error('Failed to load ticket sales')
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = ticketSales.filter(sale => {
    const matchesSearch = 
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.event_title && sale.event_title.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !filterStatus || sale.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleViewDetails = (sale: TicketSaleWithEvent) => {
    setSelectedTicketSale(sale)
    setShowDetailsModal(true)
  }

  const exportToCSV = () => {
    const csvData = filteredSales.map(sale => ({
      'Confirmation Number': `TKT-${sale.id.toString().padStart(6, '0')}`,
      'Event': sale.event_title || `Event #${sale.event_id}`,
      'Customer Name': sale.customer_name,
      'Customer Email': sale.customer_email,
      'Phone': sale.customer_phone || 'N/A',
      'Quantity': sale.quantity,
      'Total Amount': `£${sale.total_amount.toFixed(2)}`,
      'Status': sale.status,
      'Purchase Date': formatDate(sale.purchase_date)
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-sales-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Ticket sales exported to CSV')
  }

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalTickets = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} rounded-xl shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-fredericka text-gray-800 mb-2">
            <Ticket className="inline-block w-8 h-8 mr-3 text-[#9CAF88]" />
            Ticket Sales Management
          </h2>
          <p className="text-gray-600">Track and manage event ticket sales</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={filteredSales.length === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-[#9CAF88] text-[#9CAF88] hover:bg-[#9CAF88] hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadTicketSales}
            className="flex items-center space-x-2 px-4 py-2 bg-[#9CAF88] text-white hover:bg-[#8A9B7A] rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-800">£{totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Total Tickets</p>
              <p className="text-2xl font-bold text-blue-800">{totalTickets}</p>
            </div>
            <Ticket className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-purple-800">{filteredSales.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 font-medium">Avg. Sale</p>
              <p className="text-2xl font-bold text-amber-800">
                £{filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <CalendarIcon className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Ticket Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Confirmation #</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Tickets</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  {searchTerm || filterStatus ? 'No matching ticket sales found' : 'No ticket sales yet'}
                </td>
              </tr>
            ) : (
              filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      TKT-{sale.id.toString().padStart(6, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sale.event_title || `Event #${sale.event_id}`}</div>
                    {sale.event_date && (
                      <div className="text-xs text-gray-500">{formatDate(sale.event_date)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sale.customer_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {sale.customer_email}
                        </div>
                        {sale.customer_phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {sale.customer_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {sale.quantity} {sale.quantity === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    £{sale.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                      {getStatusIcon(sale.status)}
                      <span className="ml-1 capitalize">{sale.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.purchase_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(sale)}
                      className="text-[#9CAF88] hover:text-[#8A9B7A] flex items-center space-x-1 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTicketSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailsModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl transform transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-fredericka text-gray-800">
                  Ticket Sale Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Confirmation Number</label>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    TKT-{selectedTicketSale.id.toString().padStart(6, '0')}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Event</label>
                  <p className="text-gray-900">{selectedTicketSale.event_title || `Event #${selectedTicketSale.event_id}`}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="text-gray-900">{selectedTicketSale.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedTicketSale.customer_email}</p>
                  {selectedTicketSale.customer_phone && (
                    <p className="text-sm text-gray-600">{selectedTicketSale.customer_phone}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <p className="text-gray-900">{selectedTicketSale.quantity} tickets</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-gray-900 font-semibold">£{selectedTicketSale.total_amount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedTicketSale.status)}
                      <span className="ml-2 capitalize">{selectedTicketSale.status}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                    <p className="text-gray-900">{formatDate(selectedTicketSale.purchase_date)}</p>
                  </div>
                </div>
                
                {selectedTicketSale.stripe_payment_intent_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment ID</label>
                    <p className="text-sm font-mono text-gray-600">{selectedTicketSale.stripe_payment_intent_id}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketSalesManagement
