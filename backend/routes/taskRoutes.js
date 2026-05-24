const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// @desc    Get all tasks with optional filters
// @route   GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get task statistics for dashboard
// @route   GET /api/tasks/stats
router.get('/stats', async (req, res) => {
  try {
    const tasks = await Task.find({});
    
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    // Category counts
    const categories = { Work: 0, Personal: 0, Shopping: 0, Fitness: 0, Others: 0 };
    // Priority counts
    const priorities = { low: 0, medium: 0, high: 0 };

    tasks.forEach(task => {
      if (categories[task.category] !== undefined) {
        categories[task.category]++;
      } else {
        categories.Others++;
      }

      if (priorities[task.priority] !== undefined) {
        priorities[task.priority]++;
      }
    });

    res.json({
      total,
      pending,
      inProgress,
      completed,
      categories,
      priorities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      category,
      dueDate: dueDate || null
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Clear all completed tasks
// @route   DELETE /api/tasks/completed
router.delete('/completed', async (req, res) => {
  try {
    const result = await Task.deleteMany({ status: 'completed' });
    res.json({ message: 'All completed tasks deleted', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a single task
// @route   DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
