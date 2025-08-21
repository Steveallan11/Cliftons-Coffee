import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  Save,
  AlertCircle,
  Check,
  SortAsc,
  SortDesc,
  MoreVertical,
  Package,
  DollarSign,
  Image as ImageIcon,
  Grid,
  List,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import { menuManagementService, MenuItem, MenuCategory } from '@/utils/menuManagementService'

interface MenuManagementProps {
  darkMode?: boolean
}

const MenuManagement: React.FC<MenuManagementProps> = ({ darkMode = false }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAvailability, setFilterAvailability] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    is_available: true,
    stock_level: null,
    sort_order: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [itemsResult, categoriesResult] = await Promise.all([
        menuManagementService.getMenuItems(),
        menuManagementService.getMenuCategories()
      ])

      if (itemsResult.success && itemsResult.data) {
        setMenuItems(itemsResult.data)
      } else {
        toast.error(itemsResult.error || 'Failed to load menu items')
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      } else {
        toast.error(categoriesResult.error || 'Failed to load categories')
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Failed to load menu data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, itemId?: number) => {
    try {
      setUploading(true)
      const result = await menuManagementService.uploadMenuImage(file, itemId)
      
      if (result.success && result.data) {
        return result.data.publicUrl
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      let imageUrl = formData.image_url
      
      // Upload image if a new file is selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile)
        if (!imageUrl) return
      }

      const menuItemData = {
        ...formData,
        image_url: imageUrl,
        price: Number(formData.price),
        stock_level: formData.stock_level ? Number(formData.stock_level) : null,
        sort_order: formData.sort_order ? Number(formData.sort_order) : 0
      } as MenuItem

      if (editingItem) {
        const result = await menuManagementService.updateMenuItem(editingItem.id!, menuItemData)
        if (result.success) {
          toast.success('Menu item updated successfully')
          setEditingItem(null)
        } else {
          toast.error(result.error || 'Failed to update menu item')
          return
        }
      } else {
        const result = await menuManagementService.createMenuItem(menuItemData)
        if (result.success) {
          toast.success('Menu item created successfully')
          setShowAddForm(false)
        } else {
          toast.error(result.error || 'Failed to create menu item')
          return
        }
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        is_available: true,
        stock_level: null,
        sort_order: 0
      })
      setImageFile(null)
      loadData()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error('Failed to save menu item')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const result = await menuManagementService.deleteMenuItem(id)
      if (result.success) {
        toast.success('Menu item deleted successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to delete menu item')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete menu item')
    }
  }

  const handleToggleAvailability = async (id: number, currentAvailability: boolean) => {
    try {
      const result = await menuManagementService.updateMenuItem(id, {
        is_available: !currentAvailability
      })
      
      if (result.success) {
        toast.success(`Item ${!currentAvailability ? 'enabled' : 'disabled'} successfully`)
        loadData()
      } else {
        toast.error(result.error || 'Failed to update availability')
      }
    } catch (error: any) {
      console.error('Toggle availability error:', error)
      toast.error('Failed to update availability')
    }
  }

  const handleBulkAvailabilityUpdate = async (available: boolean) => {
    if (selectedItems.length === 0) {
      toast.error('No items selected')
      return
    }

    try {
      const result = await menuManagementService.bulkUpdateAvailability(selectedItems, available)
      if (result.success) {
        toast.success(`${selectedItems.length} items updated successfully`)
        setSelectedItems([])
        loadData()
      } else {
        toast.error(result.error || 'Failed to update items')
      }
    } catch (error: any) {
      console.error('Bulk update error:', error)
      toast.error('Failed to update items')
    }
  }

  const filteredAndSortedItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || item.category === filterCategory
      const matchesAvailability = !filterAvailability || 
        (filterAvailability === 'available' ? item.is_available : !item.is_available)
      return matchesSearch && matchesCategory && matchesAvailability
    })
    .sort((a, b) => {
      let compareValue = 0
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'price':
          compareValue = a.price - b.price
          break
        case 'category':
          compareValue = a.category.localeCompare(b.category)
          break
        case 'created_at':
          compareValue = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
          break
        default:
          compareValue = 0
      }
      return sortOrder === 'desc' ? -compareValue : compareValue
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-fredericka mb-2">Menu Management</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your coffee shop menu items, prices, and availability
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Categories
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#9CAF88] hover:bg-[#8A9B7A] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-4 mb-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
          >
            <option value="">All Items</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
            <option value="created_at">Sort by Date Added</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-800'
            }`}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#9CAF88] text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#9CAF88] text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAvailabilityUpdate(true)}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Enable Selected
              </button>
              <button
                onClick={() => handleBulkAvailabilityUpdate(false)}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Disable Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className={`px-3 py-1 text-xs border rounded transition-colors ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items Display */}
      {viewMode === 'table' ? (
        <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredAndSortedItems.map(item => item.id!).filter(Boolean))
                        } else {
                          setSelectedItems([])
                        }
                      }}
                      className="rounded border-gray-300 text-[#9CAF88] focus:ring-[#9CAF88]"
                    />
                  </th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image</th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock</th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`p-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id!)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id!])
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id))
                          }
                        }}
                        className="rounded border-gray-300 text-[#9CAF88] focus:ring-[#9CAF88]"
                      />
                    </td>
                    <td className="p-4">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling!.setAttribute('style', 'display: flex')
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
                        <ImageIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate max-w-xs`}>
                          {item.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      £{item.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {item.stock_level !== null ? (
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${item.stock_level === 0 ? 'text-red-600' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.stock_level}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No tracking</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAvailability(item.id!, item.is_available)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          item.is_available
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.is_available ? (
                          <><Eye className="w-3 h-3" /> Available</>
                        ) : (
                          <><EyeOff className="w-3 h-3" /> Hidden</>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item)
                            setFormData(item)
                            setShowAddForm(true)
                          }}
                          className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'} transition-colors`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling!.setAttribute('style', 'display: flex')
                    }}
                  />
                ) : null}
                <div className={`w-full h-48 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
                  <ImageIcon className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                
                <div className="absolute top-3 right-3 flex space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id!)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id!])
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id))
                      }
                    }}
                    className="rounded border-gray-300 text-[#9CAF88] focus:ring-[#9CAF88] bg-white"
                  />
                </div>
                
                <div className="absolute bottom-3 left-3">
                  <button
                    onClick={() => handleToggleAvailability(item.id!, item.is_available)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      item.is_available
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Hidden'}
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {item.name}
                  </h3>
                  <span className="text-lg font-bold text-[#9CAF88]">
                    £{item.price.toFixed(2)}
                  </span>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                  
                  {item.stock_level !== null && (
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${item.stock_level === 0 ? 'text-red-600' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.stock_level}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item)
                      setFormData(item)
                      setShowAddForm(true)
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && (() => {
              setShowAddForm(false)
              setEditingItem(null)
              setFormData({
                name: '',
                description: '',
                price: 0,
                category: '',
                image_url: '',
                is_available: true,
                stock_level: null,
                sort_order: 0
              })
              setImageFile(null)
            })()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingItem(null)
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      image_url: '',
                      is_available: true,
                      stock_level: null,
                      sort_order: 0
                    })
                    setImageFile(null)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category *
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Price (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || 0}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Stock Level (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_level || ''}
                      onChange={(e) => setFormData({ ...formData, stock_level: e.target.value ? Number(e.target.value) : null })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Image
                  </label>
                  <div className="space-y-3">
                    {(formData.image_url || imageFile) && (
                      <div className="relative inline-block">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image_url: '' })
                            setImageFile(null)
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setImageFile(file)
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                          darkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload New Image
                      </label>
                      
                      {!imageFile && (
                        <input
                          type="url"
                          placeholder="Or enter image URL..."
                          value={formData.image_url || ''}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded border-gray-300 text-[#9CAF88] focus:ring-[#9CAF88]"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Available for ordering
                    </span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sort Order:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sort_order || 0}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className={`w-20 px-2 py-1 rounded border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingItem(null)
                      setFormData({
                        name: '',
                        description: '',
                        price: 0,
                        category: '',
                        image_url: '',
                        is_available: true,
                        stock_level: null,
                        sort_order: 0
                      })
                      setImageFile(null)
                    }}
                    className={`px-6 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingItem ? 'Update' : 'Create'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuManagement