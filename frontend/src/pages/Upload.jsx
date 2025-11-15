import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { sectionsAPI } from '../api/sections';
import { uploadsAPI } from '../api/uploads';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, X, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

export const Upload = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubsection, setSelectedSubsection] = useState('');
  const [files, setFiles] = useState([]);
  const [autoDate, setAutoDate] = useState(true);
  const [customDate, setCustomDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await sectionsAPI.getSections();
      setSections(response.sections || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedSection || !selectedSubsection || files.length === 0) {
      alert('Please select section, subsection, and at least one file');
      return;
    }

    try {
      setUploading(true);
      setSuccess(false);

      const formData = new FormData();
      formData.append('section', selectedSection);
      formData.append('subsection', selectedSubsection);
      formData.append('autoDate', autoDate);
      if (!autoDate) {
        formData.append('date', customDate);
      }

      files.forEach((file) => {
        formData.append('files', file);
      });

      await uploadsAPI.upload(formData);

      setSuccess(true);
      setFiles([]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const selectedSectionData = sections.find(s => s.slug === selectedSection);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Upload Files</h2>
          <p className="text-gray-600 mt-2">Upload photos and documents to reports</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Section Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setSelectedSubsection('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select section...</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section.slug}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subsection *
                </label>
                <select
                  value={selectedSubsection}
                  onChange={(e) => setSelectedSubsection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!selectedSection}
                >
                  <option value="">Select subsection...</option>
                  {selectedSectionData?.subsections?.map((subsection) => (
                    <option key={subsection.slug} value={subsection.slug}>
                      {subsection.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={autoDate}
                    onChange={() => setAutoDate(true)}
                    className="text-blue-600"
                  />
                  <span>Yesterday (automatic)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!autoDate}
                    onChange={() => setAutoDate(false)}
                    className="text-blue-600"
                  />
                  <span>Custom date</span>
                </label>
                {!autoDate && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            {/* File Dropzone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Files *
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <UploadIcon className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag and drop files here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Images only (PNG, JPG, GIF)</p>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({files.length})
                </label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-100 text-green-700 rounded-md">
                <CheckCircle size={20} />
                <span>Files uploaded successfully!</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
