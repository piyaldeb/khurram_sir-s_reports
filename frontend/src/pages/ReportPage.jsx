import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { reportsAPI } from '../api/reports';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const reportNames = {
  budget_vs_achievement: 'Monthly Budget vs Achievement',
  stock_180: '180 Days + Stock',
  ot_report: 'OT Report',
  standard_stock: 'Standard Item Stock'
};

export const ReportPage = () => {
  const { reportKey } = useParams();
  const { isAdmin } = useAuth();
  const [screenshot, setScreenshot] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
    return () => {
      // Cleanup object URL on unmount or when reportKey changes
      setImageUrl((prevUrl) => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [reportKey]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      // Cleanup old image URL
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
      }
      
      const response = await reportsAPI.getReport(reportKey);
      setScreenshot(response.screenshot);
      
      // Load image as blob to handle authentication
      if (response.screenshot?.driveFileId) {
        await loadImage();
      } else {
        console.log('[loadReport] No screenshot found or no driveFileId');
        setError('No screenshot uploaded yet. Please upload a screenshot through the Upload page.');
      }
    } catch (error) {
      console.error('Error loading report:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const loadImage = async () => {
    try {
      // Use the same base URL logic as axios config
      const baseURL = import.meta.env.VITE_API_URL || '/api';
      const imageUrl = `${baseURL}/reports/${reportKey}/image`;
      const token = localStorage.getItem('token');
      
      console.log(`[loadImage] Fetching image from: ${imageUrl}`);
      console.log(`[loadImage] Screenshot data:`, screenshot);
      
      const response = await fetch(imageUrl, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      console.log(`[loadImage] Response status: ${response.status}, contentType: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        // Handle 401 authentication errors - redirect to login
        if (response.status === 401) {
          console.error(`[loadImage] Authentication failed, redirecting to login`);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        // Handle 404 - no screenshot uploaded
        if (response.status === 404) {
          console.log(`[loadImage] No screenshot found for ${reportKey}`);
          setError('No screenshot uploaded yet. Please upload a screenshot through the Upload page.');
          return;
        }
        
        // Try to get error message from response
        let errorMessage = 'Failed to load image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error(`[loadImage] Error response:`, errorData);
        } catch (e) {
          // Response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
          console.error(`[loadImage] Non-JSON error response: ${response.statusText}`);
        }
        throw new Error(errorMessage);
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      console.log(`[loadImage] Content-Type: ${contentType}`);
      
      if (!contentType || !contentType.startsWith('image/')) {
        // Response might be an error JSON or HTML (like Google Sign-in page)
        const text = await response.text();
        console.error(`[loadImage] Non-image response (first 200 chars):`, text.substring(0, 200));
        
        if (text.includes('Google') || text.includes('Sign in')) {
          throw new Error('Received Google Sign-in page instead of image. The file may not be accessible. Please re-upload the screenshot.');
        }
        
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Invalid response format');
        } catch (e) {
          throw new Error(`Expected image but got ${contentType}. Response may be an error page.`);
        }
      }

      const blob = await response.blob();
      console.log(`[loadImage] Blob received, size: ${blob.size}, type: ${blob.type}`);
      
      // Verify blob is not empty and is an image
      if (blob.size === 0) {
        throw new Error('Image is empty');
      }
      
      // Verify it's actually an image by checking the blob type
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Expected image blob but got ${blob.type}`);
      }
      
      const url = URL.createObjectURL(blob);
      console.log(`[loadImage] Created blob URL: ${url.substring(0, 50)}...`);
      
      // Cleanup old URL
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      
      setImageUrl(url);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('[loadImage] Error loading image:', error);
      setError(error.message || 'Failed to load screenshot image');
      setImageUrl(null); // Clear image URL on error
    }
  };

  const handleRefresh = async () => {
    if (!isAdmin()) return;

    try {
      setRefreshing(true);
      setError(null);
      await reportsAPI.refreshReports(reportKey);
      // Refresh button is disabled - show message instead
      alert('Automatic screenshot capture is disabled. Please upload screenshots manually through the Upload page.\n\nGo to Upload → Select "Reports" → Choose report type → Upload your screenshot.');
    } catch (error) {
      console.error('Error refreshing report:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      alert(errorMessage || 'Please upload screenshots manually through the Upload page.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading report...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {reportNames[reportKey] || reportKey}
            </h2>
            {screenshot?.createdAt && (
              <p className="text-gray-600 mt-2">
                Last updated: {dayjs(screenshot.createdAt).format('MMM D, YYYY h:mm A')}
              </p>
            )}
          </div>
          {isAdmin() && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Screenshot Display */}
        {screenshot ? (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Commented out: Google Drive link - using uploaded screenshots instead */}
            {/* {screenshot.driveFileLink ? ( */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Report Screenshot</h3>
                  {/* Commented out: Open in new tab link */}
                  {/* <a
                    href={screenshot.driveFileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={16} />
                    Open in new tab
                  </a> */}
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={reportNames[reportKey] || reportKey}
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('[ReportPage] Image load error:', e);
                        e.target.style.display = 'none';
                        setError('Failed to load screenshot image. Please try uploading again or check if the file exists.');
                      }}
                      onLoad={() => {
                        console.log('[ReportPage] Image loaded successfully');
                      }}
                    />
                  ) : loading ? (
                    <div className="text-center py-12 text-gray-500">
                      Loading image...
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No image available. Please upload a screenshot.
                    </div>
                  )}
                </div>
              </div>
            {/* ) : (
              <div className="text-center py-12 text-gray-500">
                Screenshot URL not available
              </div>
            )} */}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12 text-gray-500">
              No screenshot available for this report.
              {isAdmin() && (
                <div className="mt-4">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Capture Screenshot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
