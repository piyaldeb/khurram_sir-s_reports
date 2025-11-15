const FileMeta = require('../models/FileMeta');
const googleService = require('../services/googleService');
const dayjs = require('dayjs');

exports.uploadFiles = async (req, res) => {
  try {
    const { section, subsection, uploadDate: uploadDateStr } = req.body;

    if (!section || !subsection) {
      return res.status(400).json({ error: 'Section and subsection are required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Determine upload date and folder structure based on section type
    let uploadDate;
    let folderPath;
    let monthYear;

    if (section === 'quality') {
      // Quality reports: daywise organization (default: yesterday)
      if (uploadDateStr) {
        uploadDate = new Date(uploadDateStr);
      } else {
        // Default to yesterday
        uploadDate = new Date();
        uploadDate.setDate(uploadDate.getDate() - 1);
      }
      // Format: DD-MMM-YY (e.g., "14-Nov-25")
      const dateFolder = dayjs(uploadDate).format('DD-MMM-YY');
      folderPath = `${dateFolder}/quality-${subsection}`;
      monthYear = dayjs(uploadDate).format('MMMM YYYY'); // For database storage
    } else if (section === 'reports') {
      // Reports section: monthwise organization (format: MMM-YY)
      uploadDate = new Date();
      // Format: MMM-YY (e.g., "Oct-25")
      const monthFolder = dayjs(uploadDate).format('MMM-YY');
      folderPath = `${monthFolder}/reports/${subsection}`;
      monthYear = dayjs(uploadDate).format('MMMM YYYY'); // For database storage
    } else {
      // Other sections: monthwise organization (format: MMMM YYYY)
      uploadDate = new Date();
      monthYear = dayjs(uploadDate).format('MMMM YYYY'); // e.g., "November 2025"
      folderPath = `${monthYear}/${section}-${subsection}`;
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Create filename with appropriate folder structure
        const fileName = `${folderPath}/${file.originalname}`;

        // Upload to Google Drive
        const driveFile = await googleService.uploadFile(
          file.buffer,
          fileName,
          file.mimetype
        );

        // Save metadata to MongoDB
        const fileMeta = new FileMeta({
          originalName: file.originalname,
          driveFileId: driveFile.fileId,
          driveFileLink: driveFile.webViewLink,
          section,
          subsection,
          date: uploadDate,
          month: monthYear,
          uploadedBy: req.user._id
        });

        await fileMeta.save();

        uploadedFiles.push({
          id: fileMeta._id,
          originalName: fileMeta.originalName,
          driveFileId: fileMeta.driveFileId,
          driveFileLink: fileMeta.driveFileLink,
          thumbnail: googleService.getFileThumbnail(fileMeta.driveFileId),
          section: fileMeta.section,
          subsection: fileMeta.subsection,
          date: fileMeta.date,
          month: fileMeta.month
        });
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
      }
    }

    res.status(201).json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.getUploads = async (req, res) => {
  try {
    const {
      section,
      subsection,
      from,
      to,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (section) query.section = section;
    if (subsection) query.subsection = subsection;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [files, total] = await Promise.all([
      FileMeta.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FileMeta.countDocuments(query)
    ]);

    const filesWithThumbnails = files.map(file => ({
      id: file._id,
      originalName: file.originalName,
      driveFileId: file.driveFileId,
      driveFileLink: file.driveFileLink,
      thumbnail: googleService.getFileThumbnail(file.driveFileId),
      section: file.section,
      subsection: file.subsection,
      date: file.date,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt
    }));

    res.json({
      files: filesWithThumbnails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};

exports.getUploadById = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileMeta.findById(id).populate('uploadedBy', 'name email');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      id: file._id,
      originalName: file.originalName,
      driveFileId: file.driveFileId,
      driveFileLink: file.driveFileLink,
      thumbnail: googleService.getFileThumbnail(file.driveFileId),
      section: file.section,
      subsection: file.subsection,
      date: file.date,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt
    });
  } catch (error) {
    console.error('Error fetching upload:', error);
    res.status(500).json({ error: 'Failed to fetch upload' });
  }
};

exports.deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileMeta.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from Google Drive
    try {
      await googleService.deleteFile(file.driveFileId);
    } catch (error) {
      console.error('Error deleting from Drive:', error);
      // Continue even if Drive deletion fails
    }

    // Delete metadata from MongoDB
    await FileMeta.findByIdAndDelete(id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileMeta.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stream from Google Drive
    const fileStream = await googleService.getFileStream(file.driveFileId);

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};
