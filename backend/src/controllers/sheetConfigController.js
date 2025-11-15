const SheetConfig = require('../models/SheetConfig');
const googleService = require('../services/googleService');

exports.getSheetConfigs = async (req, res) => {
  try {
    const configs = await SheetConfig.find().sort({ reportKey: 1 });
    res.json({ configs });
  } catch (error) {
    console.error('Error fetching sheet configs:', error);
    res.status(500).json({ error: 'Failed to fetch sheet configurations' });
  }
};

exports.getSheetConfigByKey = async (req, res) => {
  try {
    const { reportKey } = req.params;
    const config = await SheetConfig.findOne({ reportKey });

    if (!config) {
      return res.status(404).json({ error: 'Sheet configuration not found' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Error fetching sheet config:', error);
    res.status(500).json({ error: 'Failed to fetch sheet configuration' });
  }
};

exports.createSheetConfig = async (req, res) => {
  try {
    const { reportKey, reportName, sheetId, sheetUrl, tabName, range } = req.body;

    if (!reportKey || !reportName || !sheetId || !tabName || !range) {
      return res.status(400).json({
        error: 'reportKey, reportName, sheetId, tabName, and range are required'
      });
    }

    // Check if config already exists
    const existing = await SheetConfig.findOne({ reportKey });
    if (existing) {
      return res.status(400).json({ error: 'Configuration for this report already exists' });
    }

    const config = new SheetConfig({
      reportKey,
      reportName,
      sheetId,
      sheetUrl,
      tabName,
      range,
      updatedBy: req.user._id
    });

    await config.save();

    // Clear cache for this report
    googleService.clearCache(reportKey);

    res.status(201).json({ config });
  } catch (error) {
    console.error('Error creating sheet config:', error);
    res.status(500).json({ error: 'Failed to create sheet configuration' });
  }
};

exports.updateSheetConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportName, sheetId, sheetUrl, tabName, range, isActive } = req.body;

    const config = await SheetConfig.findById(id);

    if (!config) {
      return res.status(404).json({ error: 'Sheet configuration not found' });
    }

    if (reportName) config.reportName = reportName;
    if (sheetId) config.sheetId = sheetId;
    if (sheetUrl !== undefined) config.sheetUrl = sheetUrl;
    if (tabName) config.tabName = tabName;
    if (range) config.range = range;
    if (isActive !== undefined) config.isActive = isActive;

    config.updatedBy = req.user._id;
    config.updatedAt = new Date();

    await config.save();

    // Clear cache for this report
    googleService.clearCache(config.reportKey);

    res.json({ config });
  } catch (error) {
    console.error('Error updating sheet config:', error);
    res.status(500).json({ error: 'Failed to update sheet configuration' });
  }
};

exports.deleteSheetConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await SheetConfig.findByIdAndDelete(id);

    if (!config) {
      return res.status(404).json({ error: 'Sheet configuration not found' });
    }

    // Clear cache for this report
    googleService.clearCache(config.reportKey);

    res.json({ message: 'Sheet configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting sheet config:', error);
    res.status(500).json({ error: 'Failed to delete sheet configuration' });
  }
};

exports.testSheetConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await SheetConfig.findById(id);

    if (!config) {
      return res.status(404).json({ error: 'Sheet configuration not found' });
    }

    // Try to fetch data with this config
    try {
      const data = await googleService.getSheetDataByConfig({
        sheetId: config.sheetId,
        range: config.fullRange
      });

      res.json({
        success: true,
        message: 'Successfully connected to Google Sheet',
        preview: {
          headers: data.headers,
          rowCount: data.data.length,
          firstRow: data.data[0] || null
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to fetch data from Google Sheet',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error testing sheet config:', error);
    res.status(500).json({ error: 'Failed to test sheet configuration' });
  }
};
