import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MapPin, Phone, Mail, ShoppingBag, Receipt } from 'lucide-react'
import { orderService, OrderDetails } from '@/utils/orderService'
import toast from 'react-hot-toast'

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number | null
  onStatusUpdate?: () => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onStatusUpdate
}) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails()
    }
  }, [isOpen, orderId])

  const loadOrderDetails = async () => {
    if (!orderId) return
    
    setLoading(true)
    try {
      const result = await orderService.getOrderDetails(orderId)
      if (result.success && result.data) {
        setOrderDetails(result.data)
      } else {
        toast.error(result.error || 'Failed to load order details')
      }
    } catch (error) {
      console.error('Error loading order details:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!orderDetails?.order.id) return
    
    setUpdating(true)
    try {
      const result = await orderService.updateOrderStatus(
        orderDetails.order.id,
        newStatus,
        'admin@cliftonscoffee.com'
      )
      
      if (result.success) {
        setOrderDetails(prev => prev ? {
          ...prev,
          order: { ...prev.order, status: newStatus }
        } : null)
        toast.success('Order status updated successfully')
        onStatusUpdate?.()
      } else {
        toast.error(result.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#9CAF88] text-white p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Receipt className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">
                  Order #{orderId}
                </h2>
                <p className="text-green-100 text-sm">
                  {orderDetails ? formatDate(orderDetails.order.created_at) : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-100px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orderDetails ? (
              <div className="p-6 space-y-6">
                {/* Order Info & Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <ShoppingBag className="w-5 h-5" />
                      <span>Order Information</span>
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Order Type:</span>
                        <span className="font-medium capitalize">{orderDetails.order.order_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderDetails.order.status)}`}>
                          {orderDetails.order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg text-[#9CAF88]">
                          {formatCurrency(orderDetails.order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>Customer Information</span>
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{orderDetails.order.customer_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{orderDetails.order.customer_email}</span>
                      </div>
                      {orderDetails.order.customer_phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{orderDetails.order.customer_phone}</span>
                        </div>
                      )}
                      {orderDetails.order.delivery_address && (
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-right max-w-48">{orderDetails.order.delivery_address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="text-left p-4 font-medium text-gray-700">Item</th>
                            <th className="text-center p-4 font-medium text-gray-700">Price</th>
                            <th className="text-center p-4 font-medium text-gray-700">Qty</th>
                            <th className="text-right p-4 font-medium text-gray-700">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.items.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-4">
                                <div>
                                  <div className="font-medium text-gray-800">{item.item_name}</div>
                                  {item.special_requests && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      Note: {item.special_requests}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">{formatCurrency(item.item_price)}</td>
                              <td className="p-4 text-center">{item.quantity}</td>
                              <td className="p-4 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-200">
                          <tr>
                            <td colSpan={3} className="p-4 font-semibold text-gray-800 text-right">
                              Total ({orderDetails.summary.totalQuantity} items):
                            </td>
                            <td className="p-4 text-right font-bold text-lg text-[#9CAF88]">
                              {formatCurrency(orderDetails.summary.total)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updating || orderDetails.order.status === status}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          orderDetails.order.status === status
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#9CAF88] text-white hover:bg-[#8A9F78] disabled:opacity-50'
                        }`}
                      >
                        {updating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          status.replace('_', ' ')
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {orderDetails.order.special_instructions && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Special Instructions</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-700">{orderDetails.order.special_instructions}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Failed to load order details</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default OrderDetailsModal