import express from 'express';
import Location from '../models/locationModel.js';

const router = express.Router();

// ✅ Save Customer Location
router.post('/location', async (req, res) => {
  const { latitude, longitude, address } = req.body;

  try {
    const newLocation = new Location({
      latitude,
      longitude,
      address,
    });

    await newLocation.save();
    res.status(201).json({ message: 'Location saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save location' });
  }
});

export default router;
