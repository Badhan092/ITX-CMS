const express = require("express");
const router = express.Router();

let conn;

// Set DB connection
function setConnection(dbConn) {
    conn = dbConn;
}

// ==================== FAQ ROUTES ====================

// GET all FAQs
router.get("/faq", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM faq ORDER BY id ASC");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        res.status(500).json({message: "Server error"});
    }
});

// GET single FAQ by ID
router.get("/faq/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM faq WHERE id=?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({message: "Not found"});
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching FAQ:", err);
        res.status(500).json({message: "Server error"});
    }
});

// POST create FAQ
router.post("/faq", async (req, res) => {
    try {
        const {question, answer} = req.body;
        if (!question || !answer) {
            return res.status(400).json({message: "Question and answer are required"});
        }

        const [result] = await conn.execute(
            `INSERT INTO faq (question, answer) VALUES (?, ?)`,
            [question, answer]
        );

        const [newRow] = await conn.execute("SELECT * FROM faq WHERE id=?", [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        console.error("Error creating FAQ:", err);
        res.status(500).json({message: "Server error"});
    }
});

// PUT update FAQ
router.put("/faq/:id", async (req, res) => {
    try {
        const {question, answer} = req.body;
        if (!question || !answer) {
            return res.status(400).json({message: "Question and answer are required"});
        }

        const [result] = await conn.execute(
            `UPDATE faq SET question=?, answer=?, updatedAt=NOW() WHERE id=?`,
            [question, answer, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({message: "Not found"});

        const [updated] = await conn.execute("SELECT * FROM faq WHERE id=?", [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        console.error("Error updating FAQ:", err);
        res.status(500).json({message: "Server error"});
    }
});

// DELETE FAQ
router.delete("/faq/:id", async (req, res) => {
    try {
        const [result] = await conn.execute("DELETE FROM faq WHERE id=?", [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({message: "Not found"});

        res.json({message: "Deleted successfully"});
    } catch (err) {
        console.error("Error deleting FAQ:", err);
        res.status(500).json({message: "Server error"});
    }
});

module.exports = {router, setConnection};
