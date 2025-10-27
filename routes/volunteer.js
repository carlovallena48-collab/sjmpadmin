const express = require("express");
const VolunteerApplication = require("../models/VolunteerApplication");
const { logActivity, generateRequestNumber } = require("../utils/helpers");

const router = express.Router();

// GET all volunteer applications
router.get("/", async (req, res) => {
    try {
        console.log("📤 Fetching all volunteer applications...");
        const applications = await VolunteerApplication.find().sort({ createdAt: -1 }).lean();
        console.log(`✅ Found ${applications.length} volunteer applications`);
        res.json(applications);
    } catch (err) {
        console.error("❌ Failed to fetch volunteer applications:", err.message);
        res.status(500).json({ message: "Failed to fetch volunteer applications: " + err.message });
    }
});

// POST - Create volunteer application
router.post("/", async (req, res) => {
    try {
        console.log("📥 Received volunteer application:", req.body);
        
        const requestNumber = generateRequestNumber("VOL");
        
        const applicationData = {
            ministry: req.body.ministry,
            fullName: req.body.fullName,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            submittedByEmail: req.body.submittedByEmail || 'admin@sjmp.com',
            applicationDate: new Date(req.body.applicationDate || new Date()),
            requestNumber: requestNumber,
            status: 'pending',
            createdAt: new Date(),
            lastUpdated: new Date()
        };
        
        const newApplication = await VolunteerApplication.create(applicationData);
        await logActivity("CREATE", "volunteerapplications", newApplication.fullName, newApplication.email);
        console.log("✅ Volunteer application created:", newApplication);
        res.status(201).json(newApplication);
    } catch (err) {
        console.error("❌ Failed to create volunteer application:", err.message);
        res.status(400).json({ message: "Failed to create volunteer application: " + err.message });
    }
});

// PUT - Update volunteer application
router.put("/:id", async (req, res) => {
    try {
        console.log("🔄 Updating volunteer application:", req.params.id, req.body);
        
        const updateData = { 
            ...req.body,
            lastUpdated: new Date()
        };
        const actionBy = 'admin';
        
        if (updateData.status === 'rejected' && updateData.rejection_reason) {
            updateData.rejected_by = actionBy;
            updateData.rejected_at = new Date();
            updateData.processedBy = null;
            updateData.processedDate = null;
        } else if (updateData.status === 'approved') {
            updateData.processedBy = actionBy;
            updateData.processedDate = new Date();
            updateData.rejection_reason = '';
            updateData.rejected_by = '';
            updateData.rejected_at = null;
        } else if (updateData.status === 'pending') {
            updateData.rejection_reason = '';
            updateData.rejected_by = '';
            updateData.rejected_at = null;
            updateData.processedBy = null;
            updateData.processedDate = null;
        }
        
        const updatedApplication = await VolunteerApplication.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        if (!updatedApplication) {
            console.log("❌ Volunteer application not found:", req.params.id);
            return res.status(404).json({ message: "Application not found" });
        }
        
        await logActivity("UPDATE", "volunteerapplications", updatedApplication.fullName, updatedApplication.email);
        console.log("✅ Volunteer application updated:", updatedApplication);
        res.json(updatedApplication);
    } catch (err) {
        console.error("❌ Failed to update volunteer application:", err.message);
        res.status(400).json({ message: "Failed to update application: " + err.message });
    }
});

// DELETE - Remove volunteer application
router.delete("/:id", async (req, res) => {
    try {
        const deletedApplication = await VolunteerApplication.findByIdAndDelete(req.params.id);
        if (!deletedApplication) return res.status(404).json({ message: "Application not found" });
        await logActivity("DELETE", "volunteerapplications", deletedApplication.fullName, deletedApplication.email);
        res.json({ message: "Application deleted" });
    } catch (err) {
        console.error("❌ Failed to delete volunteer application:", err.message);
        res.status(400).json({ message: "Failed to delete application" });
    }
});

// GET single volunteer application
router.get("/:id", async (req, res) => {
    try {
        console.log("📤 Fetching volunteer application:", req.params.id);
        const application = await VolunteerApplication.findById(req.params.id);
        if (!application) {
            console.log("❌ Volunteer application not found:", req.params.id);
            return res.status(404).json({ message: "Application not found" });
        }
        console.log("✅ Volunteer application found:", application.fullName);
        res.json(application);
    } catch (err) {
        console.error("❌ Failed to fetch volunteer application:", err.message);
        res.status(500).json({ message: "Failed to fetch volunteer application: " + err.message });
    }
});

module.exports = router;