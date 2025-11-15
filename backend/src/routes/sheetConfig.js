const express = require('express');
const router = express.Router();
const sheetConfigController = require('../controllers/sheetConfigController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', authenticate, requireAdmin, sheetConfigController.getSheetConfigs);
router.get('/:reportKey', authenticate, requireAdmin, sheetConfigController.getSheetConfigByKey);
router.post('/', authenticate, requireAdmin, sheetConfigController.createSheetConfig);
router.put('/:id', authenticate, requireAdmin, sheetConfigController.updateSheetConfig);
router.delete('/:id', authenticate, requireAdmin, sheetConfigController.deleteSheetConfig);
router.post('/:id/test', authenticate, requireAdmin, sheetConfigController.testSheetConfig);

module.exports = router;
