const express = require("express");
const router = express.Router();

let conn;

function setConnection(dbConn) {
    conn = dbConn;
}

// ✅ Get section info
router.get("/testimonial_section", async (req, res) => {
    try {
        const [rows] = await conn.execute("SELECT * FROM testimonial_section LIMIT 1");
        res.json(rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
});

// ✅ Update section info (create if not exists)
router.post("/testimonial_section", async (req, res) => {
    try {
        const {sectionTitle, sectionSubtitle, sectionDescription} = req.body;
        const [rows] = await conn.execute("SELECT id FROM testimonial_section LIMIT 1");

        if (rows.length) {
            // ✅ Update testimonial_section (not client_section)
            await conn.execute(
                "UPDATE testimonial_section SET sectionTitle=?, sectionSubtitle=?, sectionDescription=? WHERE id=?",
                [sectionTitle, sectionSubtitle, sectionDescription, rows[0].id]
            );
        } else {
            // ✅ Insert into testimonial_section
            await conn.execute(
                "INSERT INTO testimonial_section (sectionTitle, sectionSubtitle, sectionDescription) VALUES (?, ?, ?)",
                [sectionTitle, sectionSubtitle, sectionDescription]
            );
        }

        const [updated] = await conn.execute("SELECT * FROM testimonial_section LIMIT 1");
        res.json(updated[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
});

module.exports = {router, setConnection};
