'use client';

import { useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';

interface ContentTemplate {
  id: string;
  name: string;
  category: 'Social' | 'Blog' | 'Email' | 'Video';
  description: string;
  thumbnail: string;
  usage: number;
  lastUpdated: string;
}

const mockTemplates: ContentTemplate[] = [
  {
    id: '1',
    name: 'Product Launch Post',
    category: 'Social',
    description: 'Perfect template for announcing new products on social media',
    thumbnail: '🚀',
    usage: 245,
    lastUpdated: '2025-09-20'
  },
  {
    id: '2',
    name: 'Behind the Scenes',
    category: 'Social',
    description: 'Show your audience what happens behind the scenes',
    thumbnail: '📸',
    usage: 189,
    lastUpdated: '2025-09-18'
  },
  {
    id: '3',
    name: 'Customer Testimonial',
    category: 'Social',
    description: 'Showcase customer reviews and testimonials',
    thumbnail: '⭐',
    usage: 167,
    lastUpdated: '2025-09-15'
  },
  {
    id: '4',
    name: 'Weekly Newsletter',
    category: 'Email',
    description: 'Professional newsletter template for weekly updates',
    thumbnail: '📧',
    usage: 134,
    lastUpdated: '2025-09-22'
  },
  {
    id: '5',
    name: 'Tutorial Video Script',
    category: 'Video',
    description: 'Script template for creating tutorial videos',
    thumbnail: '🎥',
    usage: 98,
    lastUpdated: '2025-09-19'
  },
  {
    id: '6',
    name: 'Company Blog Post',
    category: 'Blog',
    description: 'Professional blog post template for company updates',
    thumbnail: '📝',
    usage: 76,
    lastUpdated: '2025-09-21'
  }
];

export default function ContentTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Social' as ContentTemplate['category'],
    description: ''
  });

  const categories = ['All', 'Social', 'Blog', 'Email', 'Video'];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      alert('Please fill in all fields');
      return;
    }
    // TODO: Connect to real backend API
    alert('Template created successfully!');
    setNewTemplate({ name: '', category: 'Social', description: '' });
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Content Templates" subtitle="Manage templates and content assets for all clients" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          
          <div className="">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Content Templates</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              Create Template
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {template.thumbnail}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.category === 'Social' ? 'bg-blue-100 text-blue-700' :
                      template.category === 'Blog' ? 'bg-green-100 text-green-700' :
                      template.category === 'Email' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{template.usage} uses</span>
                    <span>Updated {new Date(template.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Use Template
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as ContentTemplate['category'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select template category"
                >
                  <option value="Social">Social</option>
                  <option value="Blog">Blog</option>
                  <option value="Email">Email</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe this template"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}