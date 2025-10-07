const express = require("express");
const router = express.Router();

let conn;

// Set DB connection from server.js
function setConnection(connection) {
    conn = connection;
}

// ----------------- Contact Us Routes -----------------

// Submit contact form
router.post("/contact-us", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [result] = await conn.execute(
            `INSERT INTO contact_us (name, email, subject, message) VALUES (?, ?, ?, ?)`,
            [name, email, subject, message]
        );

        res.status(200).json({
            message: "Message submitted successfully",
            id: result.insertId,
        });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Get all contact messages (for admin view)
router.get("/contact-us", async (req, res) => {
    try {
        const [rows] = await conn.execute(
            `SELECT * FROM contact_us ORDER BY createdAt DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching contact messages:", err);
        res.status(500).json({ message: "Failed to fetch contact messages" });
    }
});

// Delete a contact message
router.delete("/contact-us/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await conn.execute(`DELETE FROM contact_us WHERE id = ?`, [id]);
        res.json({ message: "Contact message deleted successfully" });
    } catch (err) {
        console.error("Error deleting contact message:", err);
        res.status(500).json({ message: "Failed to delete contact message" });
    }
});

module.exports = { router, setConnection };
