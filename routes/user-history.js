const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// GET user schedule history by email
router.get("/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    console.log(`📊 Fetching REAL schedule history for: ${userEmail}`);
    
    let allSchedules = [];

    // Baptism Schedules - REAL DATA
    try {
      const Baptism = mongoose.model("Baptism") || mongoose.connection.db.collection('baptisms');
      const baptismSchedules = await Baptism.find({ email: userEmail });
      
      baptismSchedules.forEach(schedule => {
        allSchedules.push({
          sacrament: 'Baptism',
          name: schedule.childName || schedule.fullName || 'Baptism',
          date: schedule.preferredDate || schedule.date,
          time: schedule.preferredTime || schedule.time,
          status: schedule.status || 'pending',
          type: 'baptism',
          createdAt: schedule.createdAt || new Date()
        });
      });
      console.log(`✅ Found ${baptismSchedules.length} baptism schedules`);
    } catch (err) {
      console.log('❌ No baptism schedules found:', err.message);
    }

    // Confirmation Schedules - REAL DATA
    try {
      const Confirmation = mongoose.model("Confirmation") || mongoose.connection.db.collection('confirmations');
      const confirmationSchedules = await Confirmation.find({ email: userEmail });
      
      confirmationSchedules.forEach(schedule => {
        allSchedules.push({
          sacrament: 'Confirmation',
          name: schedule.fullName || 'Confirmation',
          date: schedule.preferredDate || schedule.date,
          time: schedule.preferredTime || schedule.time,
          status: schedule.status || 'pending',
          type: 'confirmation',
          createdAt: schedule.createdAt || new Date()
        });
      });
      console.log(`✅ Found ${confirmationSchedules.length} confirmation schedules`);
    } catch (err) {
      console.log('❌ No confirmation schedules found:', err.message);
    }

    // Marriage Schedules - REAL DATA
    try {
      const Marriage = mongoose.model("Marriage") || mongoose.connection.db.collection('marriages');
      const marriageSchedules = await Marriage.find({ email: userEmail });
      
      marriageSchedules.forEach(schedule => {
        allSchedules.push({
          sacrament: 'Matrimony',
          name: `${schedule.groomName || ''} & ${schedule.brideName || ''}`.trim() || 'Wedding',
          date: schedule.weddingDate || schedule.date,
          time: schedule.weddingTime || schedule.time,
          status: schedule.status || 'pending',
          type: 'matrimony',
          createdAt: schedule.createdAt || new Date()
        });
      });
      console.log(`✅ Found ${marriageSchedules.length} marriage schedules`);
    } catch (err) {
      console.log('❌ No marriage schedules found:', err.message);
    }

    // Pamisa Schedules - REAL DATA
    try {
      const Pamisa = mongoose.model("Pamisa") || mongoose.connection.db.collection('pamisas');
      const pamisaSchedules = await Pamisa.find({ email: userEmail });
      
      pamisaSchedules.forEach(schedule => {
        allSchedules.push({
          sacrament: 'Pamisa',
          name: schedule.intention || 'Pamisa',
          date: schedule.preferredDate || schedule.date,
          time: schedule.preferredTime || schedule.time,
          status: schedule.status || 'pending',
          type: 'pamisa',
          createdAt: schedule.createdAt || new Date()
        });
      });
      console.log(`✅ Found ${pamisaSchedules.length} pamisa schedules`);
    } catch (err) {
      console.log('❌ No pamisa schedules found:', err.message);
    }

    // Blessing Schedules - REAL DATA
    try {
      const Blessing = mongoose.model("Blessing") || mongoose.connection.db.collection('blessings');
      const blessingSchedules = await Blessing.find({ email: userEmail });
      
      blessingSchedules.forEach(schedule => {
        allSchedules.push({
          sacrament: 'Blessing',
          name: schedule.typeOfBlessing || 'Blessing',
          date: schedule.preferredDate || schedule.date,
          time: schedule.preferredTime || schedule.time,
          status: schedule.status || 'pending',
          type: 'blessing',
          createdAt: schedule.createdAt || new Date()
        });
      });
      console.log(`✅ Found ${blessingSchedules.length} blessing schedules`);
    } catch (err) {
      console.log('❌ No blessing schedules found:', err.message);
    }

    // Funeral Schedules - REAL DATA
    try {
      const Funeral = mongoose.model("Funeral") || mongoose.connection.db.collection('funerals');
      const funeralSchedules = await Funeral.find({ email: userEmail });
      
      funeralSchedules.forEach(schedule => {
        allSchedules.push({
          sacrament: 'Funeral Mass',
          name: schedule.deceasedName || 'Funeral',
          date: schedule.preferredDate || schedule.date,
          time: schedule.preferredTime || schedule.time,
          status: schedule.status || 'pending',
          type: 'funeral',
          createdAt: schedule.createdAt || new Date()
        });
      });
      console.log(`✅ Found ${funeralSchedules.length} funeral schedules`);
    } catch (err) {
      console.log('❌ No funeral schedules found:', err.message);
    }

    // Sort by date (newest first)
    allSchedules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`🎯 TOTAL: Found ${allSchedules.length} REAL schedules for ${userEmail}`);
    
    res.json({
      success: true,
      count: allSchedules.length,
      schedules: allSchedules,
      message: `Found ${allSchedules.length} schedule records`
    });

  } catch (error) {
    console.error('❌ Error fetching user schedule history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule history',
      error: error.message
    });
  }
});

module.exports = router;