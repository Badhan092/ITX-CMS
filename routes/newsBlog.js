const express = require("express");
const router = express.Router();

let conn;

// Set DB connection
function setConnection(dbConn) {
  conn = dbConn;
}

// ==================== NEWS & BLOG ====================

// GET all news/blog
router.get("/news_blog", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM news_blog ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single news/blog by ID
router.get("/news_blog/:id", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM news_blog WHERE id=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create news/blog
router.post("/news_blog", async (req, res) => {
  try {
    const { imageUrl, title, subtitle, description, link, date } = req.body;
    if (!imageUrl || !title || !date)
      return res.status(400).json({ message: "imageUrl, title and date are required" });

    const [result] = await conn.execute(
      `INSERT INTO news_blog (imageUrl, title, subtitle, description, link, date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [imageUrl, title, subtitle || "", description || "", link || "", date]
    );

    const [newRow] = await conn.execute("SELECT * FROM news_blog WHERE id=?", [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update news/blog
router.put("/news_blog/:id", async (req, res) => {
  try {
    const { imageUrl, title, subtitle, description, link, date } = req.body;

    const [result] = await conn.execute(
      `UPDATE news_blog 
       SET imageUrl=?, title=?, subtitle=?, description=?, link=?, date=?, updatedAt=NOW() 
       WHERE id=?`,
      [imageUrl, title, subtitle || "", description || "", link || "", date, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

    const [updated] = await conn.execute("SELECT * FROM news_blog WHERE id=?", [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE news/blog
router.delete("/news_blog/:id", async (req, res) => {
  try {
    const [result] = await conn.execute("DELETE FROM news_blog WHERE id=?", [req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, setConnection };
