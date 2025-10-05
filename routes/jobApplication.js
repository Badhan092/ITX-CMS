const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
let conn;

// Set DB connection from server.js
function setConnection(connection) {
    conn = connection;
}

// Multer setup for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext);
    },
});
const upload = multer({ storage });

// ----------------- Job Applications -----------------

// Submit application
router.post("/job-apply", upload.single("resume"), async (req, res) => {
    try {
        const { name, email, phone, message, jobId } = req.body;
        if (!req.file) return res.status(400).json({ message: "Resume is required" });

        const resumePath = `/uploads/${req.file.filename}`;

        const [result] = await conn.execute(
            `INSERT INTO job_applications (job_id, name, email, phone, message, resume) VALUES (?, ?, ?, ?, ?, ?)`,
            [jobId, name, email, phone, message, resumePath]
        );

        res.status(200).json({ message: "Application submitted successfully", id: result.insertId });
    } catch (error) {
        console.error("Error submitting job application:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Get all applications
router.get("/job_applications", async (req, res) => {
    try {
        const [rows] = await conn.execute(`
            SELECT ja.*, jp.title AS jobTitle 
            FROM job_applications ja
            LEFT JOIN job_posts jp ON ja.job_id = jp.id
            ORDER BY ja.createdAt DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching job applications:", err);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
});

// Delete application
router.delete("/job_applications/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await conn.execute(`DELETE FROM job_applications WHERE id = ?`, [id]);
        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("Error deleting application:", err);
        res.status(500).json({ message: "Failed to delete application" });
    }
});

module.exports = { router, setConnection };
