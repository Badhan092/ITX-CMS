const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
let conn;

// ==================== SET DB CONNECTION ====================
function setConnection(dbConn) {
    conn = dbConn;
}

// ==================== MULTER SETUP ====================
const uploadDir = path.join(__dirname, "../uploads/job_posts");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `job-${uniqueSuffix}${ext}`);
    },
});
const upload = multer({ storage });

// ==================== JOB POSTS ROUTES ====================

// GET all job posts
router.get("/job_posts", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM job_posts ORDER BY deadline DESC");
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching job posts:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET single job post
router.get("/job_posts/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM job_posts WHERE id=?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("❌ Error fetching job post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST create new job post (with image upload)
router.post("/job_posts", upload.single("image"), async (req, res) => {
    try {
        const {
            title,
            department,
            location,
            type,
            description,
            requirements,
            responsibilities,
            salary,
            deadline,
        } = req.body;

        if (!title || !deadline) {
            return res.status(400).json({ message: "title and deadline are required" });
        }

        const image = req.file ? `/uploads/job_posts/${req.file.filename}` : "";

        const [result] = await conn.execute(
            `INSERT INTO job_posts
             (title, department, location, type, description, requirements, responsibilities, salary, deadline, image, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                title,
                department || "",
                location || "",
                type || "Full-Time",
                description || "",
                requirements || "",
                responsibilities || "",
                salary || "",
                deadline,
                image,
            ]
        );

        const [newRow] = await conn.execute("SELECT * FROM job_posts WHERE id=?", [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        console.error("❌ Error adding job post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update job post (with optional new image)
router.put("/job_posts/:id", upload.single("image"), async (req, res) => {
    try {
        const {
            title,
            department,
            location,
            type,
            description,
            requirements,
            responsibilities,
            salary,
            deadline,
            existingImage,
        } = req.body;

        if (!title || !deadline) {
            return res.status(400).json({ message: "title and deadline are required" });
        }

        let image = existingImage || "";
        if (req.file) image = `/uploads/job_posts/${req.file.filename}`;

        const [result] = await conn.execute(
            `UPDATE job_posts
             SET title=?, department=?, location=?, type=?, description=?, requirements=?, responsibilities=?, salary=?, deadline=?, image=?, updatedAt=NOW()
             WHERE id=?`,
            [
                title,
                department || "",
                location || "",
                type || "Full-Time",
                description || "",
                requirements || "",
                responsibilities || "",
                salary || "",
                deadline,
                image,
                req.params.id,
            ]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

        const [updated] = await conn.execute("SELECT * FROM job_posts WHERE id=?", [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        console.error("❌ Error updating job post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE job post
router.delete("/job_posts/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT image FROM job_posts WHERE id=?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });

        // Delete image file if exists
        const imagePath = path.join(__dirname, "..", rows[0].image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        await conn.execute("DELETE FROM job_posts WHERE id=?", [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting job post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = { router, setConnection };
