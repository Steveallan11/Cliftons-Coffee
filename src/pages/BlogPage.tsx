import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, Clock, User, ArrowLeft, Search, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { publicContentService, BlogPost, BlogCategory } from '@/utils/contentManagementService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const result = await publicContentService.getPublicContent('all', {
        published_only: true
      })

      if (result.success && result.data) {
        setPosts(result.data.blog_posts || [])
        setCategories(result.data.blog_categories || [])
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || post.category_id?.toString() === selectedCategory
    
    return matchesSearch && matchesCategory
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#9CAF88] to-[#8A9B7A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-5xl font-fredericka mb-6">
              Coffee Stories & News
            </h1>
            <p className="text-xl font-poppins opacity-90 max-w-2xl mx-auto">
              Discover brewing tips, community stories, and the latest news from Clifton's Coffee Shop
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9CAF88] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-gray-600">
            Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-gray-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative">
                  {filteredPosts[0].featured_image ? (
                    <img
                      src={filteredPosts[0].featured_image}
                      alt={filteredPosts[0].title}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 lg:h-full bg-gradient-to-br from-[#9CAF88] to-[#8A9B7A] flex items-center justify-center">
                      <Tag className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#9CAF88] text-white rounded-full text-sm font-medium">
                      Featured Article
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-fredericka text-gray-800 mb-4 line-clamp-2">
                    {filteredPosts[0].title}
                  </h2>
                  
                  {filteredPosts[0].excerpt && (
                    <p className="text-gray-600 mb-6 line-clamp-3 font-poppins text-lg">
                      {filteredPosts[0].excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-6 space-x-6">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{filteredPosts[0].author_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(filteredPosts[0].publish_date)}</span>
                    </div>
                    {filteredPosts[0].reading_time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{filteredPosts[0].reading_time} min read</span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/blog/${filteredPosts[0].slug}`}
                    className="inline-flex items-center px-6 py-3 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white font-medium rounded-full transition-colors duration-300 w-fit"
                  >
                    Read Full Article
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post, index) => {
                const category = categories.find(c => c.id === post.category_id)
                
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-[#9CAF88] to-[#8A9B7A] flex items-center justify-center">
                          <Tag className="w-12 h-12 text-white" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {category && (
                        <div className="absolute top-4 right-4">
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-md"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 font-poppins line-clamp-2">
                        {post.title}
                      </h3>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3 font-poppins">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span>{post.author_name}</span>
                          </div>
                          {post.reading_time && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{post.reading_time} min</span>
                            </div>
                          )}
                        </div>
                        <span>{formatDate(post.publish_date)}</span>
                      </div>
                      
                      <Link
                        to={`/blog/${post.slug}`}
                        className="block w-full text-center py-3 px-4 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white font-medium rounded-full transition-colors duration-300"
                      >
                        Read Article
                      </Link>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Check back soon for new articles and coffee stories!'}
              </p>
            </div>
          ) : null}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default BlogPage