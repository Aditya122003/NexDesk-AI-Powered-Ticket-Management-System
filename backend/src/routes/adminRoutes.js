const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/analytics', getAdminAnalytics);
router.get('/pending-admins', authorize('superadmin'), getPendingAdmins);
router.put('/approve-admin/:id', authorize('superadmin'), approveAdmin);
router.post('/reject-admin/:id', authorize('superadmin'), rejectAdmin);
router.delete('/reject-admin/:id', authorize('superadmin'), rejectAdmin);

// User Management Routes (Superadmin / Admin)
router.get('/users', getAllUsers);
router.delete('/users/:id', authorize('superadmin', 'admin'), deleteUser);

module.exports = router;
