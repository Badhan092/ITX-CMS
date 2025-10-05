const express = require("express");
const router = express.Router();

let conn;

// Set DB connection
function setConnection(dbConn) {
    conn = dbConn;
}

// ==================== OUR TEAM ====================

// GET all team members
router.get("/ourteam", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM ourteam ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching our team:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET single member by ID
router.get("/ourteam/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM ourteam WHERE id=?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("❌ Error fetching member:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST create new team member
router.post("/ourteam", async (req, res) => {
    try {
        const { name, role, photo, message } = req.body;

        if (!name || !role || !photo) {
            return res.status(400).json({ message: "name, role and photo are required" });
        }

        const [result] = await conn.execute(
            `INSERT INTO ourteam (name, role, photo, message, createdAt)
             VALUES (?, ?, ?, ?, NOW())`,
            [name, role, photo, message || ""]
        );

        const [newRow] = await conn.execute("SELECT * FROM ourteam WHERE id=?", [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        console.error("❌ Error adding team member:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update team member
router.put("/ourteam/:id", async (req, res) => {
    try {
        const { name, role, photo, message } = req.body;

        const [result] = await conn.execute(
            `UPDATE ourteam
             SET name=?, role=?, photo=?, message=?, updatedAt=NOW()
             WHERE id = ?`,
            [name || "", role || "", photo || "", message || "", req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

        const [updated] = await conn.execute("SELECT * FROM ourteam WHERE id=?", [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        console.error("❌ Error updating team member:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE team member
router.delete("/ourteam/:id", async (req, res) => {
    try {
        const [result] = await conn.execute("DELETE FROM ourteam WHERE id=?", [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting team member:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = { router, setConnection };
