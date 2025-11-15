const googleService = require('../services/googleService');

exports.getReport = async (req, res) => {
  try {
    const { reportKey } = req.params;

    const validReportKeys = [
      'budget_vs_achievement',
      'stock_180',
      'ot_report',
      'standard_stock'
    ];

    if (!validReportKeys.includes(reportKey)) {
      return res.status(400).json({ error: 'Invalid report key' });
    }

    const data = await googleService.getSheetData(reportKey);

    res.json({
      reportKey,
      data: data.data,
      headers: data.headers,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.refreshReports = async (req, res) => {
  try {
    const { reportKey } = req.body;

    if (reportKey) {
      googleService.clearCache(reportKey);
    } else {
      googleService.clearCache();
    }

    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error refreshing reports:', error);
    res.status(500).json({ error: 'Failed to refresh reports' });
  }
};

exports.getAllReportKeys = (req, res) => {
  const reportKeys = [
    { key: 'budget_vs_achievement', name: 'Monthly Budget vs Achievement' },
    { key: 'stock_180', name: '180 Days + Stock' },
    { key: 'ot_report', name: 'OT Report' },
    { key: 'standard_stock', name: 'Standard Item Stock' }
  ];

  res.json({ reportKeys });
};
