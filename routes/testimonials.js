const express = require("express");
const router = express.Router();

let conn;

// Set DB connection
function setConnection(dbConn) {
    conn = dbConn;
}

// ==================== TESTIMONIALS ====================

// GET all testimonials
router.get("/testimonials", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM testimonials ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching testimonials:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET single testimonial by ID
router.get("/testimonials/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM testimonials WHERE id=?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("❌ Error fetching testimonial:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST create testimonial
router.post("/testimonials", async (req, res) => {
    try {
        const { title, subTitle, tag, text, img, name, role } = req.body;

        if (!text || !name)
            return res.status(400).json({ message: "text and name are required" });

        const [result] = await conn.execute(
            `INSERT INTO testimonials (title, subTitle, tag, text, img, name, role, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [title || "", subTitle || "", tag || "", text, img || "", name, role || ""]
        );

        const [newRow] = await conn.execute("SELECT * FROM testimonials WHERE id=?", [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        console.error("❌ Error adding testimonial:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update testimonial
router.put("/testimonials/:id", async (req, res) => {
    try {
        const { title, subTitle, tag, text, img, name, role } = req.body;

        const [result] = await conn.execute(
            `UPDATE testimonials
             SET title=?, subTitle=?, tag=?, text=?, img=?, name=?, role=?, updatedAt=NOW()
             WHERE id = ?`,
            [title || "", subTitle || "", tag || "", text, img || "", name, role || "", req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

        const [updated] = await conn.execute("SELECT * FROM testimonials WHERE id=?", [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        console.error("❌ Error updating testimonial:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE testimonial
router.delete("/testimonials/:id", async (req, res) => {
    try {
        const [result] = await conn.execute("DELETE FROM testimonials WHERE id=?", [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting testimonial:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = { router, setConnection };
