const puppeteer = require('puppeteer');
const googleService = require('./googleService');
const FileMeta = require('../models/FileMeta');
const SheetConfig = require('../models/SheetConfig');
const dayjs = require('dayjs');

class ScreenshotService {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async captureSheetScreenshot(reportKey, userId) {
    try {
      // Get sheet configuration
      const sheetConfig = await SheetConfig.findOne({ reportKey, isActive: true });
      if (!sheetConfig) {
        throw new Error(`No configuration found for report: ${reportKey}`);
      }

      // COMMENTED OUT: Google Sheets URL navigation - using uploaded screenshots instead
      // Construct Google Sheets URL
      // const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetConfig.sheetId}/edit#gid=0`;

      // Initialize browser
      const browser = await this.initialize();
      const page = await browser.newPage();

      // Set viewport size
      await page.setViewport({ width: 1920, height: 1080 });

      // COMMENTED OUT: Navigate to Google Sheets - using uploaded screenshots instead
      // Navigate to sheet
      // await page.goto(sheetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for sheet to load
      // await new Promise(resolve => setTimeout(resolve, 3000));

      // COMMENTED OUT: Taking screenshot from Google Sheets - using uploaded screenshots instead
      // Take screenshot
      // const screenshot = await page.screenshot({ fullPage: true });

      // COMMENTED OUT: Automatic screenshot capture - using uploaded screenshots instead
      // For now, return error indicating screenshots should be uploaded manually
      await page.close();
      throw new Error('Automatic screenshot capture is disabled. Please upload screenshots manually through the upload feature.');

      // COMMENTED OUT: Upload to Google Drive - using uploaded screenshots instead
      // const uploadDate = new Date();
      // const monthYear = dayjs(uploadDate).format('MMMM YYYY');
      // const fileName = `${monthYear}/reports/${reportKey}.png`;

      // const driveFile = await googleService.uploadFile(
      //   screenshot,
      //   fileName,
      //   'image/png'
      // );

      // COMMENTED OUT: Save metadata to MongoDB - using uploaded screenshots instead
      // const fileMeta = new FileMeta({
      //   originalName: `${reportKey}.png`,
      //   driveFileId: driveFile.fileId,
      //   driveFileLink: driveFile.webViewLink,
      //   section: 'reports',
      //   subsection: reportKey,
      //   date: uploadDate,
      //   month: monthYear,
      //   uploadedBy: userId
      // });

      // await fileMeta.save();

      // return {
      //   id: fileMeta._id,
      //   originalName: fileMeta.originalName,
      //   driveFileId: fileMeta.driveFileId,
      //   driveFileLink: fileMeta.driveFileLink,
      //   thumbnail: googleService.getFileThumbnail(fileMeta.driveFileId),
      //   section: fileMeta.section,
      //   subsection: fileMeta.subsection,
      //   date: fileMeta.date,
      //   month: fileMeta.month
      // };
    } catch (error) {
      console.error(`Error capturing screenshot for ${reportKey}:`, error);
      throw error;
    }
  }

  async getLatestScreenshot(reportKey) {
    try {
      const latestScreenshot = await FileMeta.findOne({
        section: 'reports',
        subsection: reportKey
      })
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'name email');

      if (!latestScreenshot) {
        return null;
      }

      return {
        id: latestScreenshot._id,
        originalName: latestScreenshot.originalName,
        driveFileId: latestScreenshot.driveFileId,
        driveFileLink: latestScreenshot.driveFileLink,
        thumbnail: googleService.getFileThumbnail(latestScreenshot.driveFileId),
        section: latestScreenshot.section,
        subsection: latestScreenshot.subsection,
        date: latestScreenshot.date,
        month: latestScreenshot.month,
        uploadedBy: latestScreenshot.uploadedBy,
        createdAt: latestScreenshot.createdAt
      };
    } catch (error) {
      console.error(`Error getting latest screenshot for ${reportKey}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new ScreenshotService();
