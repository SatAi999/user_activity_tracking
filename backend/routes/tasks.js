const express = require('express');
const { body } = require('express-validator');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);

router.post(
  '/',
  [body('title').notEmpty().withMessage('Task title is required')],
  createTask
);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

module.exports = router;
