'use client';

import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Upload, Image as ImageIcon, Video, File, Search, Grid, List, Trash2, ExternalLink } from 'lucide-react';

interface MediaLibraryViewProps {
  role: string;
}

type MediaItem = {
  id: number | string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number | null;
  height: number | null;
  alt: string;
  url: string | null;
  createdAt: string;
};

function kindOf(mime: string): 'image' | 'video' | 'document' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
}

function formatSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaLibraryView({ role }: MediaLibraryViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load media');
      const data = (await res.json()) as { docs: MediaItem[] };
      setFiles(data.docs);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt', file.name);
      const res = await fetch('/api/admin/media', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.filename}"?`)) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setFiles((prev) => prev.filter((f) => f.id !== item.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || kindOf(file.mimeType) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: string) => (type === 'image' ? ImageIcon : type === 'video' ? Video : File);
  const getFileColor = (type: string) =>
    type === 'image' ? 'from-blue-500 to-blue-600' : type === 'video' ? 'from-purple-500 to-purple-600' : 'from-gray-500 to-gray-600';

  return (
    <DashboardLayout title="Media Library" role={role}>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Media Library</h2>
            <p className="text-gray-600">Upload and manage your website media files</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading…' : 'Upload File'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {error && <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-700">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Total Files</div>
            <div className="text-3xl text-[#1a1f71]">{files.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Images</div>
            <div className="text-3xl text-blue-600">{files.filter((f) => kindOf(f.mimeType) === 'image').length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Videos</div>
            <div className="text-3xl text-purple-600">{files.filter((f) => kindOf(f.mimeType) === 'video').length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-1">Documents</div>
            <div className="text-3xl text-gray-600">{files.filter((f) => kindOf(f.mimeType) === 'document').length}</div>
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
                    selectedFilter === filter ? 'bg-[#2563eb] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
                  <Grid className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
                  <List className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-400">Loading…</div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-400">No media files found.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => {
              const type = kindOf(file.mimeType);
              const FileIcon = getFileIcon(type);
              return (
                <div key={file.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className={`h-48 bg-gradient-to-br ${getFileColor(type)} flex items-center justify-center relative`}>
                    {type === 'image' && file.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.alt || file.filename} className="h-full w-full object-cover" />
                    ) : (
                      <FileIcon className="w-16 h-16 text-white" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {file.url && (
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                          <ExternalLink className="w-5 h-5 text-gray-700" />
                        </a>
                      )}
                      <button onClick={() => handleDelete(file)} className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#1a1f71] font-medium mb-2 truncate">{file.filename}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatSize(file.filesize)}</span>
                      <span>{file.width && file.height ? `${file.width}x${file.height}` : '—'}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{new Date(file.createdAt).toLocaleDateString()}</div>
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
                  const type = kindOf(file.mimeType);
                  const FileIcon = getFileIcon(type);
                  return (
                    <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getFileColor(type)} rounded-lg flex items-center justify-center`}>
                            <FileIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[#1a1f71] font-medium">{file.filename}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 capitalize">{type}</td>
                      <td className="py-4 px-6 text-gray-600">{formatSize(file.filesize)}</td>
                      <td className="py-4 px-6 text-gray-600">{file.width && file.height ? `${file.width}x${file.height}` : '—'}</td>
                      <td className="py-4 px-6 text-gray-600">{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-end">
                          {file.url && (
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button onClick={() => handleDelete(file)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
