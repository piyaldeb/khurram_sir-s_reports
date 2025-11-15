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
      // Verify folder exists and is accessible (handle both regular folders and Shared Drives)
      if (this.driveFolderId) {
        try {
          const folderInfo = await this.drive.files.get({
            fileId: this.driveFolderId,
            fields: 'id, name',
            supportsAllDrives: true
          });
          console.log(`[uploadFile] Uploading to folder: ${folderInfo.data.name} (${this.driveFolderId})`);
        } catch (folderError) {
          // For Shared Drives, the folder check might fail even if access is correct
          // Continue with upload anyway - the upload will fail if there's a real access issue
          console.warn(`[uploadFile] Cannot verify folder ${this.driveFolderId}: ${folderError.message}`);
          console.warn(`[uploadFile] Continuing with upload - if this is a Shared Drive, verification may fail but upload should work`);
        }
      }
      
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: this.driveFolderId ? [this.driveFolderId] : undefined
        },
        media: {
          mimeType: mimeType,
          body: bufferStream
        },
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true,
        // For Shared Drives, we need these additional parameters
        includeItemsFromAllDrives: true
      });

      const fileId = response.data.id;
      console.log(`[uploadFile] File created with ID: ${fileId}, name: ${fileName}`);

      // Make file publicly accessible (or accessible to anyone with link)
      try {
        await this.drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          },
          supportsAllDrives: true
        });
        console.log(`[uploadFile] File ${fileId} set to public access (anyone)`);
      } catch (permError) {
        console.error(`[uploadFile] Error setting public permissions for ${fileId}:`, permError.message);
      }
      
      // Also ensure service account has access (in case public access fails)
      try {
        const serviceAccountEmail = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).client_email;
        await this.drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'user',
            emailAddress: serviceAccountEmail
          },
          supportsAllDrives: true
        });
        console.log(`[uploadFile] File ${fileId} shared with service account: ${serviceAccountEmail}`);
      } catch (permError) {
        console.error(`[uploadFile] Error sharing with service account:`, permError.message);
        // Continue anyway
      }

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
        fileId: fileId,
        supportsAllDrives: true
      });
      return true;
    } catch (error) {
      console.error('Error deleting file from Drive:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileStream(fileId) {
    try {
      console.log(`[getFileStream] Fetching file stream for Drive ID: ${fileId}`);
      
      // First verify the file exists and we have access
      try {
        const fileInfo = await this.drive.files.get({
          fileId: fileId,
          fields: 'id, name, mimeType, size',
          supportsAllDrives: true
        });
        console.log(`[getFileStream] File info:`, {
          id: fileInfo.data.id,
          name: fileInfo.data.name,
          mimeType: fileInfo.data.mimeType,
          size: fileInfo.data.size
        });
      } catch (infoError) {
        console.error(`[getFileStream] Error getting file info:`, infoError.message);
        throw new Error(`File not accessible: ${infoError.message}`);
      }
      
      // Get the file stream using service account credentials
      // Use the authenticated client to ensure service account access
      const auth = await this.auth.getClient();
      const drive = google.drive({ version: 'v3', auth });
      
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
          supportsAllDrives: true
        },
        { responseType: 'stream' }
      );
      
      console.log(`[getFileStream] File stream obtained successfully`);
      
      // Verify the stream is actually binary data, not HTML
      let firstChunk = null;
      response.data.once('data', (chunk) => {
        firstChunk = chunk.toString('utf8', 0, Math.min(200, chunk.length));
        if (firstChunk.includes('<!DOCTYPE') || firstChunk.includes('<html') || firstChunk.includes('Sign in')) {
          console.error(`[getFileStream] WARNING: Stream appears to be HTML (Google Sign-in page) instead of image binary!`);
          console.error(`[getFileStream] First 200 chars:`, firstChunk);
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('[getFileStream] Error getting file stream:', error);
      console.error('[getFileStream] Error details:', {
        message: error.message,
        code: error.code,
        errors: error.errors
      });
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  getFileThumbnail(fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }
}

module.exports = new GoogleService();
