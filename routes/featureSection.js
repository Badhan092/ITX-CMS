const express = require("express");
const router = express.Router();
let conn;

function setConnection(connection) {
  conn = connection;
}

// 🔹 GET all feature sections
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

// 🔹 GET single feature
router.get("/feature/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await conn.execute(
      "SELECT * FROM feature_section WHERE id=?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Feature not found" });
    const feature = rows[0];
    feature.slugs = feature.slugs ? JSON.parse(feature.slugs) : [];
    feature.images = feature.images ? JSON.parse(feature.images) : [];
    res.json(feature);
  } catch (err) {
    console.error("❌ Error fetching feature:", err);
    res.status(500).json({ message: "Error fetching feature" });
  }
});

// 🔹 POST add new feature
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
        button2 || "",
      ]
    );

    const [rows] = await conn.execute(
      "SELECT * FROM feature_section WHERE id=?",
      [result.insertId]
    );
    const feature = rows[0];
    feature.slugs = feature.slugs ? JSON.parse(feature.slugs) : [];
    feature.images = feature.images ? JSON.parse(feature.images) : [];
    res.status(201).json(feature);
  } catch (err) {
    console.error("❌ Error adding feature:", err);
    res.status(500).json({ message: "Error adding feature" });
  }
});

// 🔹 PUT update feature
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
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Feature not found" });

    const [rows] = await conn.execute("SELECT * FROM feature_section WHERE id=?", [id]);
    const feature = rows[0];
    feature.slugs = feature.slugs ? JSON.parse(feature.slugs) : [];
    feature.images = feature.images ? JSON.parse(feature.images) : [];
    res.json(feature);
  } catch (err) {
    console.error("❌ Error updating feature:", err);
    res.status(500).json({ message: "Error updating feature" });
  }
});

// 🔹 DELETE feature
router.delete("/feature/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Deleting feature id:", id, "conn exists:", !!conn);

  if (!conn) return res.status(500).json({ message: "Database connection not set" });

  try {
    const [result] = await conn.execute("DELETE FROM feature_section WHERE id=?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feature not found" });
    }
    res.json({ message: "Feature deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting feature:", err);
    res.status(500).json({ message: "Error deleting feature" });
  }
});

module.exports = { router, setConnection };
