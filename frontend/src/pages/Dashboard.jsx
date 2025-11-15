import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { reportsAPI } from '../api/reports';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, Package, Users } from 'lucide-react';

export const Dashboard = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [budget, stock] = await Promise.all([
        reportsAPI.getReport('budget_vs_achievement').catch(() => null),
        reportsAPI.getReport('stock_180').catch(() => null)
      ]);

      setBudgetData(budget);
      setStockData(stock);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Reports',
      value: '6',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Budget Achievement',
      value: budgetData?.data?.length ? `${budgetData.data.length} months` : '-',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Stock Items',
      value: stockData?.data?.length || '-',
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Sections',
      value: '3',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">Overview of all reports and metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold mt-2">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Achievement Chart */}
          {budgetData && budgetData.data && budgetData.data.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Budget vs Achievement</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData.data.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={budgetData.headers?.[0] || 'Month'} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {budgetData.headers && budgetData.headers.length > 1 && (
                    <>
                      <Bar dataKey={budgetData.headers[1]} fill="#3b82f6" />
                      {budgetData.headers[2] && <Bar dataKey={budgetData.headers[2]} fill="#10b981" />}
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Stock Trend Chart */}
          {stockData && stockData.data && stockData.data.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Stock Trend (180 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stockData.data.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={stockData.headers?.[0] || 'Date'} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {stockData.headers && stockData.headers.length > 1 && (
                    <Line type="monotone" dataKey={stockData.headers[1]} stroke="#8b5cf6" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/upload"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package size={20} className="text-blue-600" />
              <span>Upload Files</span>
            </a>
            <a
              href="/reports/budget_vs_achievement"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={20} className="text-green-600" />
              <span>View Reports</span>
            </a>
            <a
              href="/admin"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users size={20} className="text-purple-600" />
              <span>Admin Panel</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
