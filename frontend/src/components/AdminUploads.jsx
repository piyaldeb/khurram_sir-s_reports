import { useState, useEffect } from 'react';
import { uploadsAPI } from '../api/uploads';
import { Trash2, Download, Search } from 'lucide-react';
import dayjs from 'dayjs';

export const AdminUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    section: '',
    subsection: '',
    from: '',
    to: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadUploads();
  }, [filters]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const response = await uploadsAPI.getUploads(filters);
      setUploads(response.files || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error loading uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await uploadsAPI.deleteUpload(id);
      await loadUploads();
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert('Failed to delete file');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      section: '',
      subsection: '',
      from: '',
      to: '',
      page: 1
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Uploaded Files</h3>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Section"
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Subsection"
            value={filters.subsection}
            onChange={(e) => setFilters({ ...filters, subsection: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            placeholder="From"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            placeholder="To"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Search size={16} />
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-8">Loading uploads...</div>
      ) : uploads.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No files found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((file) => (
              <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden">
                  <img
                    src={file.thumbnail}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-sm truncate">{file.originalName}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {file.section} / {file.subsection}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Date: {dayjs(file.date).format('MMM D, YYYY')}
                </p>
                <p className="text-xs text-gray-500">
                  Uploaded by: {file.uploadedBy?.name || 'Unknown'}
                </p>
                <div className="flex gap-2 mt-3">
                  <a
                    href={file.driveFileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  >
                    <Download size={14} />
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.pages}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
