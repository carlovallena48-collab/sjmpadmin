const express = require('express');
const router = express.Router();
const SickCall = require('../models/SickCall');

// GET all sick call requests
router.get('/', async (req, res) => {
  try {
    const requests = await SickCall.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single sick call request
router.get('/:id', async (req, res) => {
  try {
    const request = await SickCall.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Sick call request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new sick call request
router.post('/', async (req, res) => {
  try {
    const sickCall = new SickCall(req.body);
    const newSickCall = await sickCall.save();
    res.status(201).json(newSickCall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update sick call request
router.put('/:id', async (req, res) => {
  try {
    const request = await SickCall.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Sick call request not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      request[key] = req.body[key];
    });

    // Handle reason system
    if (req.body.status === 'cancelled' && req.body.cancellation_reason) {
      request.cancelled_at = new Date();
    }
    if (req.body.status === 'rejected' && req.body.rejection_reason) {
      request.rejected_at = new Date();
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const request = await SickCall.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Sick call request not found' });
    }

    Object.keys(req.body).forEach(key => {
      request[key] = req.body[key];
    });

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE sick call request
router.delete('/:id', async (req, res) => {
  try {
    const request = await SickCall.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Sick call request not found' });
    }

    await SickCall.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sick call request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;