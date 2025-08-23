const express = require("express");
const router = express.Router();

let conn;

function setConnection(dbConn) {
  conn = dbConn;
}

// GET all pages
router.get("/pages", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM pages ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add new page
router.post("/pages", async (req, res) => {
  try {
    let { title, slug, description, content } = req.body;
    if (!title || !slug)
      return res.status(400).json({ message: "Title and slug are required" });

    // Make slug URL-safe
    slug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    // Ensure uniqueness
    const [existing] = await conn.execute("SELECT id FROM pages WHERE slug = ?", [slug]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Slug already exists" });

    const [result] = await conn.execute(
      "INSERT INTO pages (title, slug, description, content) VALUES (?, ?, ?, ?)",
      [title, slug, description || "", content || ""]
    );

    res.status(201).json({ id: result.insertId, title, slug, description, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, setConnection };
