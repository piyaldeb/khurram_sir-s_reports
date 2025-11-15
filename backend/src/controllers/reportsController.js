const googleService = require('../services/googleService');
const screenshotService = require('../services/screenshotService');

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

    // Get latest screenshot from uploaded files (reports section)
    const FileMeta = require('../models/FileMeta');
    
    // Try to find a valid screenshot (one that exists in Google Drive)
    let latestScreenshot = null;
    const screenshots = await FileMeta.find({
      section: 'reports',
      subsection: reportKey
    })
      .sort({ createdAt: -1 })
      .limit(10) // Check up to 10 most recent files
      .populate('uploadedBy', 'name email');

    // Verify each file exists in Google Drive
    const { google } = require('googleapis');
    const { getGoogleAuth } = require('../utils/googleAuth');
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    for (const screenshot of screenshots) {
      try {
        // Check if file exists and is accessible (support Shared Drives)
        // Use corpora: 'allDrives' to search in Shared Drives
        await drive.files.get({
          fileId: screenshot.driveFileId,
          fields: 'id',
          supportsAllDrives: true,
          // For Shared Drives, we need to specify corpora
          corpora: 'allDrives'
        });
        // File exists, use this one
        latestScreenshot = screenshot;
        console.log(`[getReport] Found accessible file: ${screenshot.driveFileId}`);
        break;
      } catch (error) {
        // File doesn't exist or isn't accessible, try next one
        console.warn(`[getReport] File ${screenshot.driveFileId} not accessible: ${error.message}`);
        continue;
      }
    }

    if (!latestScreenshot) {
      return res.json({ 
        screenshot: null,
        message: 'No accessible screenshot found. Please upload a new screenshot through the Upload page.'
      });
    }

    const screenshot = {
      id: latestScreenshot._id,
      originalName: latestScreenshot.originalName,
      driveFileId: latestScreenshot.driveFileId,
      // Removed driveFileLink and thumbnail - using proxy endpoint instead
      section: latestScreenshot.section,
      subsection: latestScreenshot.subsection,
      date: latestScreenshot.date,
      month: latestScreenshot.month,
      uploadedBy: latestScreenshot.uploadedBy,
      createdAt: latestScreenshot.createdAt
    };

    res.json({ screenshot });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.refreshReports = async (req, res) => {
  try {
    const { reportKey } = req.body;

    if (!reportKey) {
      return res.status(400).json({ error: 'reportKey is required' });
    }

    // Automatic screenshot capture is disabled - return message
    res.status(400).json({ 
      error: 'Automatic screenshot capture is disabled. Please upload screenshots manually through the Upload page.',
      message: 'To update a report screenshot, go to Upload page, select "Reports" section, choose the report type, and upload your screenshot file.'
    });
  } catch (error) {
    console.error('Error refreshing reports:', error);
    res.status(500).json({ error: 'Failed to refresh report' });
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

exports.getScreenshotImage = async (req, res) => {
  try {
    const { reportKey } = req.params;
    console.log(`[getScreenshotImage] Request for reportKey: ${reportKey}`);

    const validReportKeys = [
      'budget_vs_achievement',
      'stock_180',
      'ot_report',
      'standard_stock'
    ];

    if (!validReportKeys.includes(reportKey)) {
      console.log(`[getScreenshotImage] Invalid report key: ${reportKey}`);
      return res.status(400).json({ error: 'Invalid report key' });
    }

    // Get latest screenshot from uploaded files (reports section)
    const FileMeta = require('../models/FileMeta');
    
    // Try to find a valid screenshot (one that exists in Google Drive)
    let latestScreenshot = null;
    const screenshots = await FileMeta.find({
      section: 'reports',
      subsection: reportKey
    })
      .sort({ createdAt: -1 })
      .limit(10); // Check up to 10 most recent files

    console.log(`[getScreenshotImage] Found ${screenshots.length} screenshot(s) in database for ${reportKey}`);

    // Verify each file exists in Google Drive
    const { google } = require('googleapis');
    const { getGoogleAuth } = require('../utils/googleAuth');
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    for (const screenshot of screenshots) {
      try {
        // Check if file exists and is accessible
        await drive.files.get({
          fileId: screenshot.driveFileId,
          fields: 'id'
        });
        // File exists, use this one
        latestScreenshot = screenshot;
        console.log(`[getScreenshotImage] Valid screenshot found: ${screenshot.driveFileId}`);
        break;
      } catch (error) {
        console.warn(`[getScreenshotImage] File ${screenshot.driveFileId} not accessible: ${error.message}`);
        // File doesn't exist or isn't accessible, try next one
        continue;
      }
    }

    if (!latestScreenshot || !latestScreenshot.driveFileId) {
      console.log(`[getScreenshotImage] No accessible screenshot found for ${reportKey}`);
      return res.status(404).json({ 
        error: 'Screenshot not found or not accessible',
        message: 'Please upload a new screenshot through the Upload page.'
      });
    }

    console.log(`[getScreenshotImage] Using screenshot: ${latestScreenshot.driveFileId}`);

    console.log(`[getScreenshotImage] Fetching file stream for Drive ID: ${latestScreenshot.driveFileId}`);
    
    // Get file metadata (reuse drive client from above)
    try {
      const fileMetadata = await drive.files.get({
        fileId: latestScreenshot.driveFileId,
        fields: 'id, name, mimeType',
        supportsAllDrives: true
      });
      
      console.log(`[getScreenshotImage] File metadata:`, {
        id: fileMetadata.data.id,
        name: fileMetadata.data.name,
        mimeType: fileMetadata.data.mimeType
      });
      
      // Verify it's an image
      if (!fileMetadata.data.mimeType || !fileMetadata.data.mimeType.startsWith('image/')) {
        console.warn(`[getScreenshotImage] File is not an image: ${fileMetadata.data.mimeType}`);
      }
    } catch (error) {
      console.error(`[getScreenshotImage] Error getting file metadata:`, error.message);
      // Continue anyway - try to get the stream
    }
    
    // Ensure file is accessible by service account (fix permissions if needed)
    try {
      const serviceAccountEmail = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).client_email;
      
      // Check current permissions
      const permissions = await drive.permissions.list({
        fileId: latestScreenshot.driveFileId,
        fields: 'permissions(id,type,role,emailAddress)',
        supportsAllDrives: true
      });
      
      const hasServiceAccountAccess = permissions.data.permissions?.some(
        p => p.emailAddress === serviceAccountEmail || p.type === 'anyone'
      );
      
      if (!hasServiceAccountAccess) {
        console.log(`[getScreenshotImage] File not accessible, fixing permissions...`);
        // Add service account access
        await drive.permissions.create({
          fileId: latestScreenshot.driveFileId,
          requestBody: {
            role: 'reader',
            type: 'user',
            emailAddress: serviceAccountEmail
          },
          supportsAllDrives: true,
          // For Shared Drives
          includeItemsFromAllDrives: true
        });
        console.log(`[getScreenshotImage] Permissions fixed for service account`);
      }
    } catch (permError) {
      console.error(`[getScreenshotImage] Error fixing permissions:`, permError.message);
      // Continue anyway - try to get the stream
    }
    
    // Get file stream from Google Drive
    const fileStream = await googleService.getFileStream(latestScreenshot.driveFileId);
    console.log(`[getScreenshotImage] File stream obtained, piping to response`);

    // Set appropriate headers before piping
    // Try to detect content type from file extension or default to png
    const contentType = latestScreenshot.originalName?.toLowerCase().endsWith('.jpg') || 
                        latestScreenshot.originalName?.toLowerCase().endsWith('.jpeg')
                        ? 'image/jpeg' 
                        : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('[getScreenshotImage] Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream image: ' + error.message });
      }
    });

    // Handle successful completion
    fileStream.on('end', () => {
      console.log(`[getScreenshotImage] Stream completed successfully`);
    });

    // Pipe the stream to response
    fileStream.pipe(res);
  } catch (error) {
    console.error('[getScreenshotImage] Error fetching screenshot image:', error);
    console.error('[getScreenshotImage] Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to fetch image' });
    }
  }
};
