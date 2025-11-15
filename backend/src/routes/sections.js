const express = require('express');
const router = express.Router();
const sectionsController = require('../controllers/sectionsController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', authenticate, sectionsController.getSections);
router.post('/', authenticate, requireAdmin, sectionsController.createSection);
router.put('/:id', authenticate, requireAdmin, sectionsController.updateSection);
router.delete('/:id', authenticate, requireAdmin, sectionsController.deleteSection);

module.exports = router;
