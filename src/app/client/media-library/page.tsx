'use client';

import { useState } from 'react';

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState('images');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const mediaFiles = {
    images: [
      { id: 1, name: 'product-launch.jpg', type: 'image', size: '2.3 MB', uploadDate: '2024-08-01', tags: ['product', 'launch'], url: '/api/placeholder/300/200' },
      { id: 2, name: 'team-photo.jpg', type: 'image', size: '1.8 MB', uploadDate: '2024-08-02', tags: ['team', 'office'], url: '/api/placeholder/300/200' },
      { id: 3, name: 'office-space.jpg', type: 'image', size: '3.1 MB', uploadDate: '2024-08-03', tags: ['office', 'workspace'], url: '/api/placeholder/300/200' },
      { id: 4, name: 'brand-logo.png', type: 'image', size: '0.5 MB', uploadDate: '2024-08-04', tags: ['brand', 'logo'], url: '/api/placeholder/300/200' }
    ],
    videos: [
      { id: 5, name: 'product-demo.mp4', type: 'video', size: '15.2 MB', uploadDate: '2024-08-01', tags: ['demo', 'product'], duration: '2:30' },
      { id: 6, name: 'team-intro.mp4', type: 'video', size: '22.8 MB', uploadDate: '2024-08-02', tags: ['team', 'introduction'], duration: '1:45' }
    ],
    documents: [
      { id: 7, name: 'brand-guidelines.pdf', type: 'document', size: '1.2 MB', uploadDate: '2024-08-01', tags: ['brand', 'guidelines'] },
      { id: 8, name: 'content-calendar.xlsx', type: 'document', size: '0.8 MB', uploadDate: '2024-08-03', tags: ['calendar', 'planning'] }
    ]
  };

  const handleNavClick = (section: string) => {
    if (section === 'media-library') return;
    window.location.href = `/client/${section}`;
  };

  const handleFileSelect = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleUpload = () => {
    alert('File upload functionality would be implemented here with cloud storage integration.');
    setShowUploadModal(false);
  };

  const handleDelete = () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to delete');
      return;
    }
    alert(`Deleting ${selectedFiles.length} file(s). In production, this would remove files from storage.`);
    setSelectedFiles([]);
  };

  const handleDownload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to download');
      return;
    }
    alert(`Downloading ${selectedFiles.length} file(s). In production, this would trigger file downloads.`);
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">📁</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Media Library</h1>
              <p className="text-white/80 text-sm mt-1">Manage your visual content and assets</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Upload Files
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-3">
            <button 
              onClick={() => handleNavClick('')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </div>
            </button>

            <div className="bg-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📁</span>
                </div>
                <span className="font-medium">Media Library</span>
              </div>
            </div>

            <button 
              onClick={() => handleNavClick('content')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <span className="font-medium">Content & Posts</span>
              </div>
            </button>
          </nav>

          {/* Storage Info */}
          <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Storage Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">2.1 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '42%'}}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">5.0 GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              {['images', 'videos', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  Download ({selectedFiles.length})
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                >
                  Delete ({selectedFiles.length})
                </button>
              </div>
            )}
          </div>

          {/* File Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(mediaFiles as any)[activeTab].map((file: any) => (
              <div 
                key={file.id} 
                className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleFileSelect(file.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
                
                {file.type === 'image' && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-400">Image Preview</span>
                  </div>
                )}
                
                <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>Size: {file.size}</p>
                  <p>Uploaded: {file.uploadDate}</p>
                  {file.duration && <p>Duration: {file.duration}</p>}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {file.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {(mediaFiles as any)[activeTab].length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">{getFileIcon(activeTab.slice(0, -1))}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
              <p className="text-gray-500">Upload some {activeTab} to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowUploadModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Files</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-xl">📁</span>
              </div>
              <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
              <button
                onClick={handleUpload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Choose Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
