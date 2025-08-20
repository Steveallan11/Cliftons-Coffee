import React, { useState } from 'react'
import { populateMenuItems } from '@/utils/menuDataImport'

const DatabaseAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const handlePopulateMenu = async () => {
    setLoading(true)
    setStatus('Populating menu items...')
    
    try {
      const success = await populateMenuItems()
      if (success) {
        setStatus('✅ Successfully populated menu items in Supabase!')
      } else {
        setStatus('⚠️ Could not populate menu items. Supabase may not be configured.')
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Database Administration</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
          <p className="text-gray-600 mb-4">
            Populate the Supabase database with menu items from the static JSON file.
            This is only needed once when setting up the database.
          </p>
          
          <button
            onClick={handlePopulateMenu}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#9CAF88] text-white hover:bg-[#8ba078]'
            }`}
          >
            {loading ? 'Populating...' : 'Populate Menu Items'}
          </button>
          
          {status && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 text-sm">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatabaseAdmin