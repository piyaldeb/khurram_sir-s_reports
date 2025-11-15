const { google } = require('googleapis');
const { getGoogleAuth } = require('../utils/googleAuth');
const stream = require('stream');

// Cache for sheet data with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class GoogleService {
  constructor() {
    this.auth = getGoogleAuth();
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.sheetsConfig = JSON.parse(process.env.GOOGLE_SHEETS_CONFIG || '{}');
    this.driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  // Google Sheets methods
  async getSheetData(reportKey) {
    // First check database for dynamic config
    const SheetConfig = require('../models/SheetConfig');
    const dbConfig = await SheetConfig.findOne({ reportKey, isActive: true });

    const cacheKey = `sheet_${reportKey}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    let config;
    if (dbConfig) {
      // Use database config
      config = {
        sheetId: dbConfig.sheetId,
        range: dbConfig.fullRange
      };
    } else {
      // Fallback to environment config
      config = this.sheetsConfig[reportKey];
      if (!config) {
        throw new Error(`Report configuration not found for: ${reportKey}`);
      }
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.sheetId,
        range: config.range
      });

      const rows = response.data.values || [];
      const data = this.normalizeSheetData(rows);

      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching sheet data for ${reportKey}:`, error);
      throw new Error(`Failed to fetch sheet data: ${error.message}`);
    }
  }

  async getSheetDataByConfig(config) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.sheetId,
        range: config.range
      });

      const rows = response.data.values || [];
      const data = this.normalizeSheetData(rows);

      return data;
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw new Error(`Failed to fetch sheet data: ${error.message}`);
    }
  }

  normalizeSheetData(rows) {
    if (!rows || rows.length === 0) {
      return { headers: [], data: [] };
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return { headers, data };
  }

  clearCache(reportKey = null) {
    if (reportKey) {
      cache.delete(`sheet_${reportKey}`);
    } else {
      cache.clear();
    }
  }

  // Google Drive methods
  async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.driveFolderId]
        },
        media: {
          mimeType: mimeType,
          body: bufferStream
        },
        fields: 'id, name, webViewLink, webContentLink'
      });

      const fileId = response.data.id;

      // Make file publicly accessible (or accessible to anyone with link)
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
      };
    } catch (error) {
      console.error('Error uploading file to Drive:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting file from Drive:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileStream(fileId) {
    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media'
        },
        { responseType: 'stream' }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting file stream:', error);
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  getFileThumbnail(fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }
}

module.exports = new GoogleService();
