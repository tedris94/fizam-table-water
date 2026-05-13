import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Upload, Image as ImageIcon, Video, File, Search, Grid, List, Trash2, Download, Eye } from 'lucide-react';

interface MediaLibraryViewProps {
  role: string;
}

export function MediaLibraryView({ role }: MediaLibraryViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mediaFiles = [
    { id: 1, name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', uploadDate: '2024-02-03', url: '#', dimensions: '1920x1080' },
    { id: 2, name: 'product-sachet.png', type: 'image', size: '856 KB', uploadDate: '2024-02-02', url: '#', dimensions: '800x600' },
    { id: 3, name: 'logo-fizam.svg', type: 'image', size: '12 KB', uploadDate: '2024-02-01', url: '#', dimensions: '500x500' },
    { id: 4, name: 'team-photo.jpg', type: 'image', size: '3.1 MB', uploadDate: '2024-01-30', url: '#', dimensions: '1600x900' },
    { id: 5, name: 'factory-tour.mp4', type: 'video', size: '45 MB', uploadDate: '2024-01-28', url: '#', dimensions: '1920x1080' },
    { id: 6, name: 'certification.pdf', type: 'document', size: '1.2 MB', uploadDate: '2024-01-25', url: '#', dimensions: 'N/A' },
    { id: 7, name: 'water-bottle.png', type: 'image', size: '640 KB', uploadDate: '2024-01-20', url: '#', dimensions: '600x800' },
    { id: 8, name: 'testimonial-bg.jpg', type: 'image', size: '1.8 MB', uploadDate: '2024-01-15', url: '#', dimensions: '1200x800' },
  ];

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || file.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      default:
        return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'from-blue-500 to-blue-600';
      case 'video':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <DashboardLayout title="Media Library" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Media Library</h2>
            <p className="text-gray-600">Upload and manage your website media files</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all">
            <Upload className="w-5 h-5" />
            Upload Files
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Total Files</div>
            <div className="text-3xl text-[#1a1f71]">{mediaFiles.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Images</div>
            <div className="text-3xl text-blue-600">{mediaFiles.filter(f => f.type === 'image').length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Videos</div>
            <div className="text-3xl text-purple-600">{mediaFiles.filter(f => f.type === 'video').length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Documents</div>
            <div className="text-3xl text-gray-600">{mediaFiles.filter(f => f.type === 'document').length}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {['all', 'image', 'video', 'document'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div key={file.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className={`h-48 bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center relative`}>
                    <FileIcon className="w-16 h-16 text-white" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#1a1f71] font-medium mb-2 truncate">{file.name}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{file.size}</span>
                      <span>{file.dimensions}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{new Date(file.uploadDate).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Name</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Type</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Size</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Dimensions</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Upload Date</th>
                  <th className="text-right py-4 px-6 text-gray-600 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getFileColor(file.type)} rounded-lg flex items-center justify-center`}>
                            <FileIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[#1a1f71] font-medium">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 capitalize">{file.type}</td>
                      <td className="py-4 px-6 text-gray-600">{file.size}</td>
                      <td className="py-4 px-6 text-gray-600">{file.dimensions}</td>
                      <td className="py-4 px-6 text-gray-600">{new Date(file.uploadDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-end">
                          <button className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
