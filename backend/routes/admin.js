const express = require('express');
const {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllTasks,
  adminDeleteTask,
  getActivityLogs,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);

router.get('/tasks', getAllTasks);
router.delete('/tasks/:id', adminDeleteTask);

router.get('/logs', getActivityLogs);

module.exports = router;
