'use client';

import { useRef, useState, DragEvent, useEffect, useCallback } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
import { withBasePath } from '@/lib/basePath';

export default function MediaLibrary() {
  const [selectedTab, setSelectedTab] = useState('All');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploaded, setUploaded] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  
  // Map progress (0-100) to Tailwind width utility classes (in 10% steps)
  const progressWidthClass = (p: number) => {
    if (p >= 100) return 'w-full';
    if (p >= 90) return 'w-[90%]';
    if (p >= 80) return 'w-[80%]';
    if (p >= 70) return 'w-[70%]';
    if (p >= 60) return 'w-[60%]';
    if (p >= 50) return 'w-1/2';
    if (p >= 40) return 'w-[40%]';
    if (p >= 30) return 'w-[30%]';
    if (p >= 20) return 'w-1/5';
    if (p >= 10) return 'w-[10%]';
    return 'w-0';
  };

  const mediaFiles = [
    { id: 1, name: 'brand_logo.png', type: 'Image', size: '2.4 MB', uploaded: '2 hours ago', thumbnail: '🖼️' },
    { id: 2, name: 'product_video.mp4', type: 'Video', size: '15.2 MB', uploaded: '1 day ago', thumbnail: '🎬' },
    { id: 3, name: 'instagram_story.png', type: 'Image', size: '1.8 MB', uploaded: '3 hours ago', thumbnail: '🖼️' },
    { id: 4, name: 'campaign_banner.jpg', type: 'Image', size: '3.1 MB', uploaded: '5 hours ago', thumbnail: '🖼️' },
    { id: 5, name: 'promo_video.mp4', type: 'Video', size: '22.7 MB', uploaded: '2 days ago', thumbnail: '🎬' },
    { id: 6, name: 'social_graphic.gif', type: 'GIF', size: '5.3 MB', uploaded: '1 day ago', thumbnail: '🎭' }
  ];

  const tabs = ['All', 'Images', 'Videos', 'GIFs', 'Documents'];

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setIsUploading(true);
    setUploadProgress(5);
    const form = new FormData();
    for (const f of files) form.append('files', f);
    // Simulated progress while uploading
    let prog = 5;
    const tick = setInterval(() => {
      prog = Math.min(prog + 7, 90);
      setUploadProgress(prog);
    }, 200);
    try {
      const res = await fetch(withBasePath('/api/upload'), {
        method: 'POST',
        body: form,
      });
      clearInterval(tick);
      if (!res.ok) throw new Error(await res.text());
      setUploadProgress(100);
      // In a real app, merge returned files into state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 400);
  // Refresh list
  await refreshList();
    } catch (e) {
      clearInterval(tick);
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload failed', e);
      alert('Upload failed');
    }
  };

  type UploadedItem = { id: string; url: string; name: string; type: string };

  const refreshList = useCallback(async () => {
    try {
      const res = await fetch(withBasePath('/api/media/list'));
      if (!res.ok) return;
      const data = await res.json();
      const items = (data?.items ?? []) as UploadedItem[];
      setUploaded(items.map((i) => ({ id: i.id, url: i.url, name: i.name, type: i.type })));
    } catch {}
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isUploading) return;
    const files = Array.from(e.dataTransfer.files || []);
    uploadFiles(files);
  };

  const onBrowseClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Top nav handles routing; sidebar removed

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Media Library" subtitle="Organize and manage your digital assets" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Main Content */}
          <div className="">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Upload Media</h2>
              </div>
              <button 
                onClick={onBrowseClick}
                disabled={isUploading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
            
            <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="">
              <input
                id="admin-media-file-input"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => uploadFiles(Array.from(e.target.files || []))}
                className="hidden"
                accept="image/*,video/*,.gif,.jpg,.jpeg,.png,.mp4,.mov"
                aria-label="Choose files to upload"
                title="Choose files to upload"
              />
              <label htmlFor="admin-media-file-input" className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center cursor-pointer block">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Drag & Drop Files Here</h3>
                <p className="text-gray-500 mb-4">or click to browse your computer</p>
                <p className="text-sm text-gray-400">Supports: JPG, PNG, GIF, MP4, MOV (Max 50MB)</p>
                {isUploading && (
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`bg-purple-600 h-2 transition-all duration-300 ease-out ${progressWidthClass(uploadProgress)}`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{uploadProgress}% uploaded</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedTab === tab
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {mediaFiles.map((file) => (
              <div key={file.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-6xl">
                  {file.thumbnail}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate mb-1">{file.name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>{file.type}</span>
                    <span>{file.size}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Uploaded {file.uploaded}</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                      Edit
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recently Uploaded (from server) */}
          {uploaded.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Recently Uploaded</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {uploaded.map((f) => (
                  <a key={f.id} href={withBasePath(f.url)} target="_blank" rel="noreferrer" className="block bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {f.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={withBasePath(f.url)} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📄</span>
                      )}
                    </div>
                    <div className="p-2 text-xs truncate" title={f.name}>{f.name}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Storage Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Storage Usage</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Used Storage</span>
                  <span className="text-2xl font-bold text-blue-600">2.8 GB</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-600 h-3 w-3/5"></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>2.8 GB used</span>
                  <span>5 GB total</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">File Statistics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
                  <div className="text-sm text-gray-600">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-1">41</div>
                  <div className="text-sm text-gray-600">GIFs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">8</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
