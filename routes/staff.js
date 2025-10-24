const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// GET all staff - FIXED
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all staff...');
    const staff = await Staff.find();
    console.log('Staff found:', staff.length);
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET staff by ID
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new staff - FIXED
router.post('/', async (req, res) => {
  try {
    console.log('Creating new staff:', req.body);
    
    const staff = new Staff({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      position: req.body.position,
      department: req.body.department,
      contact: req.body.contact,
      address: req.body.address,
      notes: req.body.notes || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    const newStaff = await staff.save();
    console.log('Staff created successfully:', newStaff);
    res.status(201).json(newStaff);
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT toggle staff status
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    staff.isActive = !staff.isActive;
    const updatedStaff = await staff.save();
    
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;