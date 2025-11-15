import { useState, useEffect } from 'react';
import { sheetConfigAPI } from '../api/sheetConfig';
import { Plus, Edit, Trash2, X, Check, TestTube, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

export const AdminSheetConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [formData, setFormData] = useState({
    reportKey: '',
    reportName: '',
    sheetId: '',
    sheetUrl: '',
    tabName: '',
    range: '',
    isActive: true
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await sheetConfigAPI.getConfigs();
      setConfigs(response.configs || []);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const handleSheetUrlChange = (url) => {
    setFormData({
      ...formData,
      sheetUrl: url,
      sheetId: extractSheetId(url)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingConfig) {
        await sheetConfigAPI.updateConfig(editingConfig._id, formData);
      } else {
        await sheetConfigAPI.createConfig(formData);
      }

      setFormData({
        reportKey: '',
        reportName: '',
        sheetId: '',
        sheetUrl: '',
        tabName: '',
        range: '',
        isActive: true
      });
      setEditingConfig(null);
      setShowForm(false);
      await loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      alert(error.response?.data?.error || 'Failed to save configuration');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      reportKey: config.reportKey,
      reportName: config.reportName,
      sheetId: config.sheetId,
      sheetUrl: config.sheetUrl || '',
      tabName: config.tabName,
      range: config.range,
      isActive: config.isActive
    });
    setShowForm(true);
    setTestResult(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      await sheetConfigAPI.deleteConfig(id);
      await loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Failed to delete configuration');
    }
  };

  const handleTest = async (id) => {
    try {
      setTesting(id);
      setTestResult(null);
      const result = await sheetConfigAPI.testConfig(id);
      setTestResult({ id, success: true, data: result });
    } catch (error) {
      setTestResult({
        id,
        success: false,
        error: error.response?.data?.error || error.message
      });
    } finally {
      setTesting(null);
    }
  };

  const cancelForm = () => {
    setFormData({
      reportKey: '',
      reportName: '',
      sheetId: '',
      sheetUrl: '',
      tabName: '',
      range: '',
      isActive: true
    });
    setEditingConfig(null);
    setShowForm(false);
    setTestResult(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading configurations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Google Sheets Configuration</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage sheet IDs, tab names, and ranges for reports
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Configuration
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How to update configurations:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Sheet URL: Copy from browser address bar</li>
              <li>Tab Name: The name of the sheet tab at the bottom</li>
              <li>Range: Example: <code className="bg-blue-100 px-1">B:K50</code> or <code className="bg-blue-100 px-1">A1:H16</code></li>
              <li>Use "Test Connection" to verify configuration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold mb-4">
            {editingConfig ? 'Edit Configuration' : 'New Configuration'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Key *
                </label>
                <input
                  type="text"
                  value={formData.reportKey}
                  onChange={(e) => setFormData({ ...formData, reportKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="budget_vs_achievement"
                  required
                  disabled={!!editingConfig}
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, underscores)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={formData.reportName}
                  onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Monthly Budget vs Achievement"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheet URL *
              </label>
              <input
                type="url"
                value={formData.sheetUrl}
                onChange={(e) => handleSheetUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the full URL from your browser. Sheet ID will be extracted automatically.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sheet ID (auto-extracted)
              </label>
              <input
                type="text"
                value={formData.sheetId}
                onChange={(e) => setFormData({ ...formData, sheetId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                placeholder="1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw"
                required
                readOnly
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tab Name *
                </label>
                <input
                  type="text"
                  value={formData.tabName}
                  onChange={(e) => setFormData({ ...formData, tabName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nov- Automation"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Exact name of the tab (case-sensitive)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Range *
                </label>
                <input
                  type="text"
                  value={formData.range}
                  onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="B:K50 or A1:H16"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Example: B:K50, A1:H16, B2:B24</p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active (visible in reports)</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Check size={16} />
                {editingConfig ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Configurations List */}
      <div className="space-y-4">
        {configs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No configurations found</p>
        ) : (
          configs.map((config) => (
            <div key={config._id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg">{config.reportName}</h4>
                    {config.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Report Key:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{config.reportKey}</code>
                    </div>
                    <div>
                      <span className="text-gray-600">Tab Name:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{config.tabName}</code>
                    </div>
                    <div>
                      <span className="text-gray-600">Range:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{config.range}</code>
                    </div>
                    <div>
                      <span className="text-gray-600">Full Range:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{config.fullRange}</code>
                    </div>
                  </div>
                  {config.sheetUrl && (
                    <div className="mt-2">
                      <a
                        href={config.sheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        Open in Google Sheets
                      </a>
                    </div>
                  )}

                  {/* Test Result */}
                  {testResult && testResult.id === config._id && (
                    <div className={`mt-3 p-3 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-start gap-2">
                        {testResult.success ? (
                          <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                        ) : (
                          <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                        )}
                        <div className="text-sm">
                          {testResult.success ? (
                            <div>
                              <p className="font-semibold text-green-800">Connection successful!</p>
                              <p className="text-green-700 mt-1">
                                Rows: {testResult.data.preview.rowCount} |
                                Columns: {testResult.data.preview.headers.length}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-red-800">Connection failed</p>
                              <p className="text-red-700 mt-1">{testResult.error}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleTest(config._id)}
                    disabled={testing === config._id}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                    title="Test connection"
                  >
                    <TestTube size={18} className={testing === config._id ? 'animate-pulse' : ''} />
                  </button>
                  <button
                    onClick={() => handleEdit(config)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(config._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
