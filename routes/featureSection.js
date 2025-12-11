const express = require("express");
const router = express.Router();
let conn;

// Set DB connection from server.js
function setConnection(connection) {
    conn = connection;
}

/* =========================================================
   GET All Features
   ========================================================= */
router.get("/feature", async (req, res) => {
    try {
        const [rows] = await conn.execute(
            "SELECT * FROM feature_section ORDER BY createdAt DESC"
        );

        rows.forEach((r) => {
            r.slugs = r.slugs ? JSON.parse(r.slugs) : [];
            r.images = r.images ? JSON.parse(r.images) : [];
        });

        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching feature sections:", err);
        res.status(500).json({ message: "Error fetching feature sections" });
    }
});

/* =========================================================
   GET Single Feature
   ========================================================= */
router.get("/feature/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await conn.execute(
            "SELECT * FROM feature_section WHERE id=?",
            [id]
        );

        if (!rows.length)
            return res.status(404).json({ message: "Feature not found" });

        const f = rows[0];
        f.slugs = f.slugs ? JSON.parse(f.slugs) : [];
        f.images = f.images ? JSON.parse(f.images) : [];

        res.json(f);
    } catch (err) {
        console.error("❌ Error fetching feature:", err);
        res.status(500).json({ message: "Error fetching feature" });
    }
});

/* =========================================================
   CREATE Feature Section
   ========================================================= */
router.post("/feature", async (req, res) => {
    const { title, subtitle, description, slugs, images, button1, button2 } = req.body;

    try {
        const [result] = await conn.execute(
            `INSERT INTO feature_section 
            (title, subtitle, description, slugs, images, button1, button2)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                subtitle || "",
                description || "",
                JSON.stringify(slugs || []),
                JSON.stringify(images || []),
                button1 || "",
                button2 || ""
            ]
        );

        res.json({ message: "Feature added", id: result.insertId });
    } catch (err) {
        console.error("❌ Error creating feature:", err);
        res.status(500).json({ message: "Error creating feature" });
    }
});

/* =========================================================
   UPDATE Feature Section
   ========================================================= */
router.put("/feature/:id", async (req, res) => {
    const id = req.params.id;
    const { title, subtitle, description, slugs, images, button1, button2 } = req.body;

    try {
        const [result] = await conn.execute(
            `UPDATE feature_section
            SET title=?, subtitle=?, description=?, slugs=?, images=?, button1=?, button2=?
            WHERE id=?`,
            [
                title,
                subtitle || "",
                description || "",
                JSON.stringify(slugs || []),
                JSON.stringify(images || []),
                button1 || "",
                button2 || "",
                id
            ]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Feature not found" });

        res.json({ message: "Feature updated" });
    } catch (err) {
        console.error("❌ Error updating feature:", err);
        res.status(500).json({ message: "Error updating feature" });
    }
});

/* =========================================================
   DELETE Feature Section
   ========================================================= */
router.delete("/feature/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await conn.execute(
            "DELETE FROM feature_section WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Feature not found" });

        res.json({ message: "Feature deleted" });
    } catch (err) {
        console.error("❌ Error deleting feature:", err);
        res.status(500).json({ message: "Error deleting feature" });
    }
});

module.exports = {
    router,
    setConnection,
};
