import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { reportsAPI } from '../api/reports';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const reportNames = {
  budget_vs_achievement: 'Monthly Budget vs Achievement',
  stock_180: '180 Days + Stock',
  ot_report: 'OT Report',
  production_zippers: 'Production - Zippers',
  production_metal: 'Production - Metal',
  quality: 'Quality Report'
};

export const ReportPage = () => {
  const { reportKey } = useParams();
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadReport();
  }, [reportKey]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReport(reportKey);
      setData(response);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isAdmin()) return;

    try {
      setRefreshing(true);
      await reportsAPI.refreshReports(reportKey);
      await loadReport();
    } catch (error) {
      console.error('Error refreshing report:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const downloadCSV = () => {
    if (!data || !data.data) return;

    const csvContent = [
      data.headers.join(','),
      ...data.data.map(row => data.headers.map(h => row[h] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportKey}_${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = data?.data?.filter(row => {
    if (!fromDate && !toDate) return true;
    const dateField = data.headers?.[0];
    if (!dateField || !row[dateField]) return true;

    const rowDate = dayjs(row[dateField]);
    if (fromDate && rowDate.isBefore(dayjs(fromDate))) return false;
    if (toDate && rowDate.isAfter(dayjs(toDate))) return false;
    return true;
  }) || [];

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
            <h2 className="text-3xl font-bold text-gray-900">{reportNames[reportKey]}</h2>
            <p className="text-gray-600 mt-2">
              Last updated: {data?.lastUpdated ? dayjs(data.lastUpdated).format('MMM D, YYYY h:mm A') : '-'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download size={16} />
              Export CSV
            </button>
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
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        {filteredData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Visual Representation</h3>
            <ResponsiveContainer width="100%" height={400}>
              {reportKey === 'stock_180' || reportKey === 'budget_vs_achievement' ? (
                <LineChart data={filteredData.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={data.headers?.[0] || 'label'} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {data.headers?.slice(1, 4).map((header, idx) => (
                    <Line
                      key={header}
                      type="monotone"
                      dataKey={header}
                      stroke={['#3b82f6', '#10b981', '#f59e0b'][idx]}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={filteredData.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={data.headers?.[0] || 'label'} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {data.headers?.slice(1, 4).map((header, idx) => (
                    <Bar
                      key={header}
                      dataKey={header}
                      fill={['#3b82f6', '#10b981', '#f59e0b'][idx]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {data?.headers?.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {data.headers.map((header, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={data?.headers?.length || 1} className="px-6 py-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
