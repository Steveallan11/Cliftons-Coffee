import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/lib/supabase'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key)
}

// Utility function to populate the database with menu items
export const populateMenuItems = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot populate menu items')
    return false
  }

  try {
    // Load the static menu data
    const response = await fetch('/data/menu.json')
    const menuData = await response.json()
    
    // Transform the data structure for Supabase
    const menuItems: Omit<MenuItem, 'id'>[] = []
    
    Object.keys(menuData).forEach(category => {
      menuData[category].forEach((item: any) => {
        menuItems.push({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          available: item.available
        })
      })
    })
    
    // Insert into Supabase
    const { data, error } = await (supabase as any)
      .from('menu_items')
      .insert(menuItems)
    
    if (error) {
      console.warn('Could not populate Supabase menu items:', error)
      return false
    }
    
    console.log('Successfully populated menu items:', data?.length || 0)
    return true
  } catch (error) {
    console.warn('Error populating menu items:', error)
    return false
  }
}

// Function to get menu items from Supabase with fallback to static data
export const getMenuItems = async (): Promise<Record<string, MenuItem[]>> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name')
      
      if (!error && data && data.length > 0) {
        console.log('Successfully loaded menu from Supabase')
        
        // Group items by category
        const groupedData: Record<string, MenuItem[]> = {}
        data.forEach((item: any) => {
          const menuItem: MenuItem = {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image_url || item.image,
            category: item.category,
            available: item.is_available
          }
          
          if (!groupedData[item.category]) {
            groupedData[item.category] = []
          }
          groupedData[item.category].push(menuItem)
        })
        
        return groupedData
      }
    } catch (error) {
      console.warn('Supabase fetch failed, falling back to static data:', error)
    }
  }
  
  // Fallback to static data
  try {
    console.log('Loading menu from static data')
    const response = await fetch('/data/menu.json')
    const staticData = await response.json()
    
    // Transform static data to match MenuItem interface
    const transformedData: Record<string, MenuItem[]> = {}
    
    Object.keys(staticData).forEach(category => {
      transformedData[category] = staticData[category].map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        available: item.available
      }))
    })
    
    return transformedData
  } catch (error) {
    console.error('Failed to load menu data:', error)
    return {}
  }
}