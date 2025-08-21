import { supabase } from '@/lib/supabase'

// Events Management Service
export interface Event {
  id?: number
  title: string
  slug: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  location?: string
  image_url?: string
  category_id?: number
  is_published: boolean
  max_attendees?: number
  current_attendees?: number
  ticket_price?: number
  created_at?: string
  updated_at?: string
}

export interface EventCategory {
  id?: number
  name: string
  description?: string
  color: string
  is_active: boolean
  created_at?: string
}

// Blog Management Service
export interface BlogPost {
  id?: number
  title: string
  slug: string
  content?: string
  excerpt?: string
  featured_image?: string
  category_id?: number
  is_published: boolean
  publish_date: string
  author_name?: string
  meta_title?: string
  meta_description?: string
  reading_time?: number
  created_at?: string
  updated_at?: string
}

export interface BlogCategory {
  id?: number
  name: string
  slug: string
  description?: string
  color: string
  is_active: boolean
  created_at?: string
}

class EventsManagementService {
  async getEvents(): Promise<{ success: boolean; data?: Event[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('events-management', {
        body: { action: 'get_events' }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting events:', error)
      return { success: false, error: error.message }
    }
  }

  async getEventCategories(): Promise<{ success: boolean; data?: EventCategory[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('events-management', {
        body: { action: 'get_event_categories' }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting event categories:', error)
      return { success: false, error: error.message }
    }
  }

  async createEvent(event: Omit<Event, 'id' | 'slug' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Event; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('events-management', {
        body: {
          action: 'create_event',
          ...event
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error creating event:', error)
      return { success: false, error: error.message }
    }
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<{ success: boolean; data?: Event; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('events-management', {
        body: {
          action: 'update_event',
          id,
          ...updates
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error updating event:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteEvent(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('events-management', {
        body: {
          action: 'delete_event',
          id
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting event:', error)
      return { success: false, error: error.message }
    }
  }

  async createEventCategory(category: Omit<EventCategory, 'id' | 'created_at'>): Promise<{ success: boolean; data?: EventCategory; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('events-management', {
        body: {
          action: 'create_event_category',
          ...category
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error creating event category:', error)
      return { success: false, error: error.message }
    }
  }
}

class BlogManagementService {
  async getBlogPosts(): Promise<{ success: boolean; data?: BlogPost[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('blog-management', {
        body: { action: 'get_blog_posts' }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting blog posts:', error)
      return { success: false, error: error.message }
    }
  }

  async getBlogCategories(): Promise<{ success: boolean; data?: BlogCategory[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('blog-management', {
        body: { action: 'get_blog_categories' }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting blog categories:', error)
      return { success: false, error: error.message }
    }
  }

  async createBlogPost(post: Omit<BlogPost, 'id' | 'slug' | 'reading_time' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('blog-management', {
        body: {
          action: 'create_blog_post',
          ...post
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error creating blog post:', error)
      return { success: false, error: error.message }
    }
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('blog-management', {
        body: {
          action: 'update_blog_post',
          id,
          ...updates
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error updating blog post:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteBlogPost(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('blog-management', {
        body: {
          action: 'delete_blog_post',
          id
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting blog post:', error)
      return { success: false, error: error.message }
    }
  }

  async createBlogCategory(category: Omit<BlogCategory, 'id' | 'slug' | 'created_at'>): Promise<{ success: boolean; data?: BlogCategory; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('blog-management', {
        body: {
          action: 'create_blog_category',
          ...category
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error creating blog category:', error)
      return { success: false, error: error.message }
    }
  }
}

// Content Image Upload Service
class ContentImageService {
  async uploadImage(
    imageFile: File, 
    type: 'event' | 'blog', 
    targetId?: number
  ): Promise<{ success: boolean; data?: { publicUrl: string; fileName: string }; error?: string }> {
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      const { data, error } = await supabase.functions.invoke('content-image-upload', {
        body: {
          imageData: base64Data,
          fileName: imageFile.name,
          type,
          targetId
        }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error uploading content image:', error)
      return { success: false, error: error.message }
    }
  }
}

// Public Content Service (for frontend display)
class PublicContentService {
  async getPublicContent(
    type: 'events' | 'blog' | 'all' | 'upcoming' | 'recent' | 'categories' = 'all',
    options: {
      limit?: number
      published_only?: boolean
      category?: string
    } = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const params = new URLSearchParams({
        type,
        limit: String(options.limit || 10),
        published: String(options.published_only !== false),
        ...(options.category && { category: options.category })
      })

      const { data, error } = await supabase.functions.invoke('public-content-api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting public content:', error)
      return { success: false, error: error.message }
    }
  }
}

export const eventsManagementService = new EventsManagementService()
export const blogManagementService = new BlogManagementService()
export const contentImageService = new ContentImageService()
export const publicContentService = new PublicContentService()