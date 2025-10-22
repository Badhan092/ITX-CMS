const express = require("express");
const router = express.Router();

let conn;

function setConnection(dbConn) {
    conn = dbConn;
}

// Get section info
router.get("/contactus_section", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM contactus_section LIMIT 1");
        res.json(rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
});

// Update section info (create if not exists)
router.post("/contactus_section", async (req, res) => {
    try {
        const {sectionTitle, sectionSubtitle, sectionDescription, sectionImage} = req.body;
        const [rows] = await conn.execute("SELECT id FROM contactus_section LIMIT 1");

        if (rows.length) {
            // Update
            await conn.execute(
                "UPDATE contactus_section SET sectionTitle=?, sectionSubtitle=?, sectionDescription=?, sectionImage=? WHERE id=?",
                [sectionTitle, sectionSubtitle, sectionDescription, sectionImage, rows[0].id]
            );
        } else {
            // Insert
            await conn.execute(
                "INSERT INTO contactus_section (sectionTitle, sectionSubtitle, sectionDescription, sectionImage) VALUES (?, ?, ?, ?)",
                [sectionTitle, sectionSubtitle, sectionDescription, sectionImage]
            );
        }

        const [updated] = await conn.execute("SELECT * FROM contactus_section LIMIT 1");
        res.json(updated[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
});

module.exports = {router, setConnection};
