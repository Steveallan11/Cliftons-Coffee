import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, Share2, Tag } from 'lucide-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { publicContentService, BlogPost, BlogCategory } from '@/utils/contentManagementService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import toast from 'react-hot-toast'

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [category, setCategory] = useState<BlogCategory | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (slug) {
      loadBlogPost()
    }
  }, [slug])

  const loadBlogPost = async () => {
    try {
      setLoading(true)
      setNotFound(false)
      
      // Get all blog posts and find the one with matching slug
      const result = await publicContentService.getPublicContent('all', {
        published_only: true
      })

      if (result.success && result.data) {
        const posts = result.data.blog_posts || []
        const categories = result.data.blog_categories || []
        const foundPost = posts.find((p: BlogPost) => p.slug === slug)
        
        if (foundPost) {
          setPost(foundPost)
          if (foundPost.category_id) {
            const postCategory = categories.find((c: BlogCategory) => c.id === foundPost.category_id)
            setCategory(postCategory || null)
          }
          
          // Get related posts (same category, excluding current post)
          const related = posts
            .filter((p: BlogPost) => p.id !== foundPost.id && p.category_id === foundPost.category_id)
            .slice(0, 3)
          setRelatedPosts(related)
        } else {
          setNotFound(true)
        }
      }
    } catch (error) {
      console.error('Error loading blog post:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
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

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-fredericka text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white font-medium rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center text-gray-600 hover:text-[#9CAF88] mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </button>
            
            <div className="mb-6">
              {category && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}
              
              <h1 className="text-4xl md:text-5xl font-fredericka text-gray-800 mb-6">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-6 font-poppins leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-gray-500">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">{post.author_name}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formatDate(post.publish_date)}</span>
                </div>
                
                {post.reading_time && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{post.reading_time} min read</span>
                  </div>
                )}
                
                <button
                  onClick={handleShare}
                  className="flex items-center text-gray-500 hover:text-[#9CAF88] transition-colors"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <section className="mb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <article className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="prose prose-lg max-w-none"
          >
            <div 
              className="whitespace-pre-wrap text-gray-700 leading-relaxed font-poppins"
              style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
            >
              {post.content}
            </div>
          </motion.div>
          
          {/* Article Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#9CAF88] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{post.author_name}</h4>
                  <p className="text-gray-600 text-sm">Coffee enthusiast and storyteller</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 text-sm">Share this article:</span>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white rounded-full transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-fredericka text-gray-800 mb-8 text-center">
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.article
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      {relatedPost.featured_image ? (
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-[#9CAF88] to-[#8A9B7A] flex items-center justify-center">
                          <Tag className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      
                      {relatedPost.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{relatedPost.author_name}</span>
                        <span>{formatDate(relatedPost.publish_date)}</span>
                      </div>
                      
                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        className="block w-full text-center py-2 px-4 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white text-sm font-medium rounded-full transition-colors"
                      >
                        Read Article
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link
                  to="/blog"
                  className="inline-flex items-center px-6 py-3 border border-[#9CAF88] text-[#9CAF88] hover:bg-[#9CAF88] hover:text-white rounded-full transition-colors"
                >
                  View All Articles
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  )
}

export default BlogDetailPage