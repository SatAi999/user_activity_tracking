const express = require('express');
const {
  getAllUsers, deleteUser, updateUserStatus,
  getAllTasks, assignTask, adminDeleteTask,
  getActivityLogs, getAnalytics, search,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/search', search);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);

router.get('/tasks', getAllTasks);
router.post('/tasks/assign', assignTask);
router.delete('/tasks/:id', adminDeleteTask);

router.get('/logs', getActivityLogs);

module.exports = router;

