// server/routes/employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// GET all employees (public)
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ lastName: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new employee (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE employee (requires authentication)
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;