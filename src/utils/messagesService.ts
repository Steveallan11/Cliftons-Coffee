import { supabase } from '@/lib/supabase'

export interface Message {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied'
  replied_at?: string
  reply_message?: string
  created_at: string
  updated_at: string
}

export interface MessagesResponse {
  data: Message[]
  total: number
  page: number
  limit: number
}

class MessagesService {
  // Submit contact form
  async submitContactForm(data: {
    name: string
    email: string
    phone?: string
    subject?: string
    message: string
  }) {
    try {
      const { data: result, error } = await supabase.functions.invoke('contact-form', {
        body: data
      })

      if (error) {
        console.error('Contact form submission error:', error)
        return { success: false, error: error.message }
      }

      return result
    } catch (error: any) {
      console.error('Contact form error:', error)
      return { success: false, error: 'Failed to send message' }
    }
  }

  // Get all messages (admin)
  async getMessages(options: {
    page?: number
    limit?: number
    status?: string
  } = {}) {
    try {
      const params = new URLSearchParams()
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.status) params.append('status', options.status)

      const { data: result, error } = await supabase.functions.invoke(
        `admin-messages?${params.toString()}`,
        { method: 'GET' }
      )

      if (error) {
        console.error('Get messages error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, ...result }
    } catch (error: any) {
      console.error('Messages fetch error:', error)
      return { success: false, error: 'Failed to fetch messages' }
    }
  }

  // Get single message (admin)
  async getMessage(id: number) {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `admin-messages?id=${id}`,
        { method: 'GET' }
      )

      if (error) {
        console.error('Get message error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: result.data }
    } catch (error: any) {
      console.error('Message fetch error:', error)
      return { success: false, error: 'Failed to fetch message' }
    }
  }

  // Update message status (admin)
  async updateMessageStatus(id: number, status: string, adminEmail: string) {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `admin-messages?id=${id}`,
        {
          method: 'PATCH',
          body: { status, admin_email: adminEmail }
        }
      )

      if (error) {
        console.error('Update message error:', error)
        return { success: false, error: error.message }
      }

      return result
    } catch (error: any) {
      console.error('Message update error:', error)
      return { success: false, error: 'Failed to update message' }
    }
  }

  // Reply to message (admin)
  async replyToMessage(id: number, replyMessage: string, adminEmail: string) {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `admin-messages?id=${id}`,
        {
          method: 'PATCH',
          body: { 
            reply_message: replyMessage, 
            admin_email: adminEmail 
          }
        }
      )

      if (error) {
        console.error('Reply message error:', error)
        return { success: false, error: error.message }
      }

      return result
    } catch (error: any) {
      console.error('Message reply error:', error)
      return { success: false, error: 'Failed to send reply' }
    }
  }
}

export const messagesService = new MessagesService()