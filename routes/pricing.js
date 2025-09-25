const express = require("express");
const router = express.Router();

let conn;

// Set DB connection
function setConnection(dbConn) {
    conn = dbConn;
}

// ==================== PRICING ROUTES ====================

// GET all pricing plans
router.get("/pricing", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM pricing ORDER BY id ASC");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching pricing plans:", err);
        res.status(500).json({message: "Server error"});
    }
});

// GET single pricing plan by ID
router.get("/pricing/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM pricing WHERE id=?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({message: "Not found"});
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching pricing plan:", err);
        res.status(500).json({message: "Server error"});
    }
});

// POST create new pricing plan
router.post("/pricing", async (req, res) => {
    try {
        const {name, tag, sub, price, features, active} = req.body;
        if (!name || !price || !features) {
            return res.status(400).json({message: "Name, price, and features are required"});
        }

        const [result] = await conn.execute(
            `INSERT INTO pricing (name, tag, sub, price, features, active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, tag || null, sub || null, price, JSON.stringify(features), active ? 1 : 0]
        );

        const [newRow] = await conn.execute("SELECT * FROM pricing WHERE id=?", [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        console.error("Error creating pricing plan:", err);
        res.status(500).json({message: "Server error"});
    }
});

// PUT update pricing plan
router.put("/pricing/:id", async (req, res) => {
    try {
        const {name, tag, sub, price, features, active} = req.body;
        if (!name || !price || !features) {
            return res.status(400).json({message: "Name, price, and features are required"});
        }

        const [result] = await conn.execute(
            `UPDATE pricing
             SET name=?,
                 tag=?,
                 sub=?,
                 price=?,
                 features=?,
                 active=?,
                 updatedAt=NOW()
             WHERE id = ?`,
            [name, tag || null, sub || null, price, JSON.stringify(features), active ? 1 : 0, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({message: "Not found"});

        const [updated] = await conn.execute("SELECT * FROM pricing WHERE id=?", [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        console.error("Error updating pricing plan:", err);
        res.status(500).json({message: "Server error"});
    }
});

// DELETE pricing plan
router.delete("/pricing/:id", async (req, res) => {
    try {
        const [result] = await conn.execute("DELETE FROM pricing WHERE id=?", [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({message: "Not found"});

        res.json({message: "Deleted successfully"});
    } catch (err) {
        console.error("Error deleting pricing plan:", err);
        res.status(500).json({message: "Server error"});
    }
});

module.exports = {router, setConnection};
