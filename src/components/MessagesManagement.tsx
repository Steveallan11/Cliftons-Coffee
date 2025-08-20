import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Eye,
  Reply,
  Check,
  X,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { messagesService, Message } from '@/utils/messagesService'
import toast from 'react-hot-toast'

interface MessagesManagementProps {
  className?: string
}

const MessagesManagement: React.FC<MessagesManagementProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMessages, setTotalMessages] = useState(0)
  const [updating, setUpdating] = useState<number | null>(null)

  const messagesPerPage = 10

  useEffect(() => {
    loadMessages()
  }, [currentPage, statusFilter])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const result = await messagesService.getMessages({
        page: currentPage,
        limit: messagesPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter
      })

      if (result.success) {
        setMessages(result.data || [])
        setTotalMessages(result.total || 0)
      } else {
        toast.error(result.error || 'Failed to load messages')
      }
    } catch (error) {
      console.error('Messages loading error:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (messageId: number, newStatus: string) => {
    setUpdating(messageId)
    try {
      const result = await messagesService.updateMessageStatus(
        messageId,
        newStatus,
        'admin@cliftonscoffee.com'
      )

      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus as any } : msg
        ))
        toast.success('Message status updated')
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setUpdating(selectedMessage.id)
    try {
      const result = await messagesService.replyToMessage(
        selectedMessage.id,
        replyText,
        'admin@cliftonscoffee.com'
      )

      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, status: 'replied', reply_message: replyText, replied_at: new Date().toISOString() }
            : msg
        ))
        setShowReplyModal(false)
        setReplyText('')
        setSelectedMessage(null)
        toast.success('Reply sent successfully')
      } else {
        toast.error(result.error || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Reply error:', error)
      toast.error('Failed to send reply')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'replied': return 'bg-green-100 text-green-800 border-green-200'
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

  const filteredMessages = messages.filter(message => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        message.name.toLowerCase().includes(search) ||
        message.email.toLowerCase().includes(search) ||
        message.subject.toLowerCase().includes(search) ||
        message.message.toLowerCase().includes(search)
      )
    }
    return true
  })

  const totalPages = Math.ceil(totalMessages / messagesPerPage)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
          <MessageCircle className="w-6 h-6" />
          <span>Messages Management</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] w-full sm:w-64"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88]"
            >
              <option value="all">All Messages</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No messages found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Try adjusting your search terms' : 'Customer messages will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                    <th className="text-left p-4 font-medium text-gray-700">Subject</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                    <th className="text-center p-4 font-medium text-gray-700">Status</th>
                    <th className="text-center p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message, index) => (
                    <motion.tr
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-800">{message.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <Mail className="w-3 h-3" />
                            <span>{message.email}</span>
                          </div>
                          {message.phone && (
                            <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                              <Phone className="w-3 h-3" />
                              <span>{message.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800 truncate max-w-xs">
                          {message.subject}
                        </div>
                        <div className="text-sm text-gray-600 truncate max-w-xs mt-1">
                          {message.message}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                        {message.replied_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Replied: {formatDate(message.replied_at)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setSelectedMessage(message)}
                            className="p-2 text-gray-600 hover:text-[#9CAF88] hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {message.status !== 'replied' && (
                            <button
                              onClick={() => {
                                setSelectedMessage(message)
                                setShowReplyModal(true)
                              }}
                              disabled={updating === message.id}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reply"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                          )}
                          
                          {message.status === 'new' && (
                            <button
                              onClick={() => handleStatusUpdate(message.id, 'read')}
                              disabled={updating === message.id}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Mark as Read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * messagesPerPage) + 1} to {Math.min(currentPage * messagesPerPage, totalMessages)} of {totalMessages} messages
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Details Modal */}
      <AnimatePresence>
        {selectedMessage && !showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="bg-[#9CAF88] text-white p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">From</label>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                  </div>
                  
                  {selectedMessage.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="font-medium">{selectedMessage.phone}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subject</label>
                    <p className="font-medium">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Message</label>
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                  
                  {selectedMessage.reply_message && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Our Reply</label>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
                        <p className="whitespace-pre-wrap">{selectedMessage.reply_message}</p>
                        <p className="text-sm text-green-600 mt-2">
                          Replied on {formatDate(selectedMessage.replied_at!)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Received: {formatDate(selectedMessage.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            >
              <div className="bg-[#9CAF88] text-white p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reply to {selectedMessage.name}</h3>
                <button
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyText('')
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Original message:</p>
                    <p className="text-gray-800">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] resize-none"
                    placeholder="Type your reply here..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowReplyModal(false)
                      setReplyText('')
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || updating === selectedMessage.id}
                    className="px-4 py-2 bg-[#9CAF88] text-white rounded-lg hover:bg-[#8A9F78] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {updating === selectedMessage.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Reply className="w-4 h-4" />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessagesManagement