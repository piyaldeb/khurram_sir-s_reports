const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/keys', authenticate, reportsController.getAllReportKeys);
router.get('/:reportKey', authenticate, reportsController.getReport);
router.post('/refresh', authenticate, requireAdmin, reportsController.refreshReports);

module.exports = router;
