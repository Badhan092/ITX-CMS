const express = require("express");
const router = express.Router();

let conn;

function setConnection(dbConn) { conn = dbConn; }

// Get section info
router.get("/client_section", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM client_section LIMIT 1");
        res.json(rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update section info (create if not exists)
router.post("/client_section", async (req, res) => {
    try {
        const { sectionTitle, sectionSubtitle, sectionDescription } = req.body;
        const [rows] = await conn.execute("SELECT id FROM client_section LIMIT 1");

        if (rows.length) {
            // Update
            await conn.execute(
                "UPDATE client_section SET sectionTitle=?, sectionSubtitle=?, sectionDescription=? WHERE id=?",
                [sectionTitle, sectionSubtitle, sectionDescription, rows[0].id]
            );
        } else {
            // Insert
            await conn.execute(
                "INSERT INTO client_section (sectionTitle, sectionSubtitle, sectionDescription) VALUES (?, ?, ?)",
                [sectionTitle, sectionSubtitle, sectionDescription]
            );
        }

        const [updated] = await conn.execute("SELECT * FROM client_section LIMIT 1");
        res.json(updated[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = { router, setConnection };
