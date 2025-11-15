const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadsController = require('../controllers/uploadsController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', authenticate, upload.array('files', 10), uploadsController.uploadFiles);
router.get('/', authenticate, uploadsController.getUploads);
router.get('/:id', authenticate, uploadsController.getUploadById);
router.get('/:id/download', authenticate, uploadsController.downloadFile);
router.delete('/:id', authenticate, requireAdmin, uploadsController.deleteUpload);

module.exports = router;
