const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', authenticate, requireAdmin, usersController.getUsers);
router.post('/', authenticate, requireAdmin, usersController.createUser);
router.put('/:id', authenticate, requireAdmin, usersController.updateUser);
router.delete('/:id', authenticate, requireAdmin, usersController.deleteUser);

module.exports = router;
