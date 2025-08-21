import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  Save,
  Tag,
  Calendar,
  Clock,
  User,
  Image as ImageIcon,
  Type,
  FileText,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  blogManagementService, 
  contentImageService, 
  BlogPost, 
  BlogCategory 
} from '@/utils/contentManagementService'

interface BlogManagementProps {
  darkMode?: boolean
}

const BlogManagement: React.FC<BlogManagementProps> = ({ darkMode = false }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category_id: undefined,
    is_published: false,
    publish_date: new Date().toISOString().split('T')[0],
    author_name: "Clifton's Coffee Shop",
    meta_title: '',
    meta_description: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#9CAF88',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [postsResult, categoriesResult] = await Promise.all([
        blogManagementService.getBlogPosts(),
        blogManagementService.getBlogCategories()
      ])

      if (postsResult.success && postsResult.data) {
        setBlogPosts(postsResult.data)
      } else {
        toast.error(postsResult.error || 'Failed to load blog posts')
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      } else {
        toast.error(categoriesResult.error || 'Failed to load categories')
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Failed to load blog data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, postId?: number) => {
    try {
      setUploading(true)
      const result = await contentImageService.uploadImage(file, 'blog', postId)
      
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
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      let featuredImage = formData.featured_image
      
      // Upload image if a new file is selected
      if (imageFile) {
        featuredImage = await handleImageUpload(imageFile)
        if (!featuredImage) return
      }

      const postData = {
        ...formData,
        featured_image: featuredImage,
        publish_date: formData.publish_date || new Date().toISOString(),
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt
      } as BlogPost

      if (editingPost) {
        const result = await blogManagementService.updateBlogPost(editingPost.id!, postData)
        if (result.success) {
          toast.success('Blog post updated successfully')
          setEditingPost(null)
        } else {
          toast.error(result.error || 'Failed to update blog post')
          return
        }
      } else {
        const result = await blogManagementService.createBlogPost(postData)
        if (result.success) {
          toast.success('Blog post created successfully')
          setShowAddForm(false)
        } else {
          toast.error(result.error || 'Failed to create blog post')
          return
        }
      }

      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error('Failed to save blog post')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const result = await blogManagementService.deleteBlogPost(id)
      if (result.success) {
        toast.success('Blog post deleted successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to delete blog post')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete blog post')
    }
  }

  const handleTogglePublished = async (id: number, currentStatus: boolean) => {
    try {
      const result = await blogManagementService.updateBlogPost(id, {
        is_published: !currentStatus
      })
      
      if (result.success) {
        toast.success(`Blog post ${!currentStatus ? 'published' : 'unpublished'} successfully`)
        loadData()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error: any) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await blogManagementService.createBlogCategory(categoryFormData)
      if (result.success) {
        toast.success('Category created successfully')
        setCategoryFormData({ name: '', description: '', color: '#9CAF88', is_active: true })
        setShowCategoryModal(false)
        loadData()
      } else {
        toast.error(result.error || 'Failed to create category')
      }
    } catch (error: any) {
      console.error('Create category error:', error)
      toast.error('Failed to create category')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image: '',
      category_id: undefined,
      is_published: false,
      publish_date: new Date().toISOString().split('T')[0],
      author_name: "Clifton's Coffee Shop",
      meta_title: '',
      meta_description: ''
    })
    setImageFile(null)
  }

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !filterCategory || post.category_id?.toString() === filterCategory
    const matchesStatus = !filterStatus || 
      (filterStatus === 'published' ? post.is_published : !post.is_published)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
          <h2 className="text-2xl font-fredericka mb-2">Blog Management</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Create and manage blog posts, news, and articles
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
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-4 mb-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search blog posts..."
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
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
          >
            <option value="">All Posts</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const category = categories.find(c => c.id === post.category_id)
          
          return (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Featured Image */}
                  <div className="flex-shrink-0">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling!.setAttribute('style', 'display: flex')
                        }}
                      />
                    ) : null}
                    <div className={`w-24 h-24 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} flex items-center justify-center ${post.featured_image ? 'hidden' : ''}`}>
                      <ImageIcon className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} line-clamp-1`}>
                            {post.title}
                          </h3>
                          {category && (
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                          <button
                            onClick={() => handleTogglePublished(post.id!, post.is_published)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              post.is_published
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {post.is_published ? 'Published' : 'Draft'}
                          </button>
                        </div>
                        
                        {post.excerpt && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <User className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {post.author_name || "Clifton's Coffee Shop"}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {formatDate(post.publish_date)}
                            </span>
                          </div>
                          
                          {post.reading_time && (
                            <div className="flex items-center space-x-1">
                              <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {post.reading_time} min read
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingPost(post)
                            setFormData({
                              ...post,
                              publish_date: post.publish_date.split('T')[0]
                            })
                            setShowAddForm(true)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id!)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No blog posts found</p>
          <p className="text-sm mt-1">Create your first blog post to get started</p>
        </div>
      )}

      {/* Add/Edit Post Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && (() => {
              setShowAddForm(false)
              setEditingPost(null)
              resetForm()
            })()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingPost(null)
                    resetForm()
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Post Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </label>
                      <select
                        value={formData.category_id || ''}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : undefined })}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Publish Date
                        </label>
                        <input
                          type="date"
                          value={formData.publish_date?.split('T')[0] || ''}
                          onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-800'
                          } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Author
                        </label>
                        <input
                          type="text"
                          value={formData.author_name || ''}
                          onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-800'
                          } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Featured Image
                    </label>
                    <div className="space-y-3">
                      {(formData.featured_image || imageFile) && (
                        <div className="relative inline-block">
                          <img
                            src={imageFile ? URL.createObjectURL(imageFile) : formData.featured_image}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, featured_image: '' })
                              setImageFile(null)
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="space-y-3">
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
                          id="blog-image-upload"
                        />
                        <label
                          htmlFor="blog-image-upload"
                          className={`w-full px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-center block ${
                            darkMode
                              ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm font-medium">Upload Featured Image</span>
                          <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    placeholder="Brief summary of the blog post..."
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Content *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={12}
                    placeholder="Write your blog post content here..."
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                {/* SEO Settings */}
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                  <h4 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    SEO Settings
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.meta_title || ''}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="SEO title (leave empty to use post title)"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Meta Description
                      </label>
                      <textarea
                        value={formData.meta_description || ''}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        rows={2}
                        placeholder="SEO description (leave empty to use excerpt)"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Publishing Options */}
                <div className="flex items-center justify-between pt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="rounded border-gray-300 text-[#9CAF88] focus:ring-[#9CAF88]"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Publish immediately
                    </span>
                  </label>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingPost(null)
                        resetForm()
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
                          <span>{editingPost ? 'Update Post' : 'Create Post'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-6 max-w-md w-full`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Blog Categories
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Existing Categories */}
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Existing Categories
                </h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {category.name}
                          </span>
                          {category.description && (
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add New Category
                </h4>
                
                <div>
                  <input
                    type="text"
                    placeholder="Category name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Description (optional)"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Color
                  </label>
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFormData({ name: '', description: '', color: '#9CAF88', is_active: true })
                      setShowCategoryModal(false)
                    }}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white rounded-lg transition-colors"
                  >
                    Add Category
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

export default BlogManagement