import { supabase } from '@/lib/supabase'

// Menu Management Service
export interface MenuItem {
  id?: number
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_available: boolean
  stock_level?: number
  sort_order?: number
  price_history?: Array<{
    old_price: number
    new_price: number
    changed_at: string
  }>
  created_at?: string
  updated_at?: string
}

export interface MenuCategory {
  id?: number
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

class MenuManagementService {
  async getMenuItems(): Promise<{ success: boolean; data?: MenuItem[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: { action: 'get_menu_items' }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting menu items:', error)
      return { success: false, error: error.message }
    }
  }

  async getMenuCategories(): Promise<{ success: boolean; data?: MenuCategory[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: { action: 'get_categories' }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting menu categories:', error)
      return { success: false, error: error.message }
    }
  }

  async createMenuItem(menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: MenuItem; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: {
          action: 'create_menu_item',
          ...menuItem
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error creating menu item:', error)
      return { success: false, error: error.message }
    }
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<{ success: boolean; data?: MenuItem; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: {
          action: 'update_menu_item',
          id,
          ...updates
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error updating menu item:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteMenuItem(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: {
          action: 'delete_menu_item',
          id
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting menu item:', error)
      return { success: false, error: error.message }
    }
  }

  async bulkUpdateAvailability(ids: number[], is_available: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: {
          action: 'bulk_update_availability',
          ids,
          is_available
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error bulk updating availability:', error)
      return { success: false, error: error.message }
    }
  }

  async uploadMenuImage(imageFile: File, menuItemId?: number): Promise<{ success: boolean; data?: { publicUrl: string; fileName: string }; error?: string }> {
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      const { data, error } = await supabase.functions.invoke('menu-image-upload', {
        body: {
          imageData: base64Data,
          fileName: imageFile.name,
          menuItemId
        }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error uploading menu image:', error)
      return { success: false, error: error.message }
    }
  }

  async createCategory(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: MenuCategory; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('menu-management', {
        body: {
          action: 'create_category',
          ...category
        }
      })

      if (error) throw error
      return { success: true, data: data.data[0] }
    } catch (error: any) {
      console.error('Error creating category:', error)
      return { success: false, error: error.message }
    }
  }
}

export const menuManagementService = new MenuManagementService()