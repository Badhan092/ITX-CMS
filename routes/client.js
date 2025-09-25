const express = require("express");
const router = express.Router();

let conn;

// Function to set DB connection
function setConnection(dbConn) {
  conn = dbConn;
}

// GET all client items
router.get("/client", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM client ORDER BY createdAt DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add new client item
router.post("/client", async (req, res) => {
  try {
    const { imageUrl, title, description } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl are required" });

    const [result] = await conn.execute(
      `INSERT INTO client (imageUrl, title, description) VALUES (?, ?, ?)`,
      [imageUrl, title, description || ""]
    );

    const [newItem] = await conn.execute("SELECT * FROM client WHERE id=?", [result.insertId]);
    res.status(201).json(newItem[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update client item
router.put("/client/:id", async (req, res) => {
  try {
    const { imageUrl, title, description } = req.body;
    const itemId = req.params.id;

    const [result] = await conn.execute(
      `UPDATE client SET imageUrl=?, title=?, description=? WHERE id=?`,
      [imageUrl, title, description || "", itemId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "client item not found" });

    const [updated] = await conn.execute("SELECT * FROM client WHERE id=?", [itemId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE client item
router.delete("/client/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const [result] = await conn.execute("DELETE FROM client WHERE id=?", [itemId]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "client item not found" });

    res.json({ message: "client item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, setConnection };
