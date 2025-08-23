const express = require("express");
const router = express.Router();

let conn;

// Function to set DB connection
function setConnection(dbConn) {
  conn = dbConn;
}

// GET all gallery items
router.get("/gallery", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM gallery ORDER BY createdAt DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add new gallery item
router.post("/gallery", async (req, res) => {
  try {
    const { imageUrl, title, description } = req.body;
    if (!imageUrl || !title) return res.status(400).json({ message: "imageUrl and title are required" });

    const [result] = await conn.execute(
      `INSERT INTO gallery (imageUrl, title, description) VALUES (?, ?, ?)`,
      [imageUrl, title, description || ""]
    );

    const [newItem] = await conn.execute("SELECT * FROM gallery WHERE id=?", [result.insertId]);
    res.status(201).json(newItem[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT update gallery item
router.put("/gallery/:id", async (req, res) => {
  try {
    const { imageUrl, title, description } = req.body;
    const itemId = req.params.id;

    const [result] = await conn.execute(
      `UPDATE gallery SET imageUrl=?, title=?, description=? WHERE id=?`,
      [imageUrl, title, description || "", itemId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Gallery item not found" });

    const [updated] = await conn.execute("SELECT * FROM gallery WHERE id=?", [itemId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE gallery item
router.delete("/gallery/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const [result] = await conn.execute("DELETE FROM gallery WHERE id=?", [itemId]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Gallery item not found" });

    res.json({ message: "Gallery item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, setConnection };
