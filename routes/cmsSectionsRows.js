const express = require("express");
const router = express.Router();

let conn;

// Function to set the database connection
function setConnection(dbConn) {
  conn = dbConn;
}

// ==================== SECTIONS ====================

// GET all sections for a page (with rows)
router.get("/sections", async (req, res) => {
  try {
    const pageId = req.query.page_id;
    if (!pageId) return res.status(400).json({ message: "page_id is required" });

    const [sections] = await conn.execute(
      `SELECT s.*, 
              sr.id AS row_id, 
              sr.title AS row_title, 
              sr.subtitle AS row_subtitle, 
              sr.button AS row_button, 
              sr.content AS row_content, 
              sr.mediaUrl AS row_mediaUrl, 
              sr.position AS row_position
       FROM sections s
       LEFT JOIN section_rows sr ON s.id = sr.section_id
       WHERE s.page_id = ?
       ORDER BY s.position ASC, sr.position ASC`,
      [pageId]
    );

    const result = [];
    const map = new Map();

    sections.forEach((sec) => {
      if (!map.has(sec.id)) {
        map.set(sec.id, { ...sec, rows: [] });
        delete map.get(sec.id).row_id;
        delete map.get(sec.id).row_title;
        delete map.get(sec.id).row_subtitle;
        delete map.get(sec.id).row_button;
        delete map.get(sec.id).row_content;
        delete map.get(sec.id).row_mediaUrl;
        delete map.get(sec.id).row_position;
        result.push(map.get(sec.id));
      }
      if (sec.row_id) {
        map.get(sec.id).rows.push({
          id: sec.row_id,
          title: sec.row_title,
          subtitle: sec.row_subtitle,
          button: sec.row_button,
          content: sec.row_content,
          mediaUrl: sec.row_mediaUrl,
          position: sec.row_position,
        });
      }
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add a new section
router.post("/sections", async (req, res) => {
  try {
    const { page_id, title, subtitle, classname, position } = req.body;
    if (!page_id || !classname)
      return res.status(400).json({ message: "page_id and classname are required" });

    const [result] = await conn.execute(
      `INSERT INTO sections (page_id, title, subtitle, classname, position) VALUES (?, ?, ?, ?, ?)`,
      [page_id, title || "", subtitle || "", classname, position || 0]
    );

    const [newSection] = await conn.execute("SELECT * FROM sections WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newSection[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update section
router.put("/sections/:id", async (req, res) => {
  try {
    const { title, subtitle, classname, position } = req.body;
    const sectionId = req.params.id;

    if (!classname) {
      return res.status(400).json({ message: "classname is required" });
    }

    const [result] = await conn.execute(
      `UPDATE sections 
      SET title=?, subtitle=?, classname=?, position=?, updatedAt=NOW() WHERE id=?`,
      [title || "", subtitle || "", classname, position || 0, sectionId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Section not found" });

    const [updated] = await conn.execute("SELECT * FROM sections WHERE id=?", [sectionId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE section
router.delete("/sections/:id", async (req, res) => {
  try {
    const sectionId = req.params.id;
    const [result] = await conn.execute("DELETE FROM sections WHERE id=?", [sectionId]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Section not found" });

    res.json({ message: "Section deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// BULK reorder sections
router.put("/sections/reorder", async (req, res) => {
  try {
    const { sections } = req.body; // [{ id, position }]
    if (!Array.isArray(sections))
      return res.status(400).json({ message: "Invalid sections array" });

    await conn.beginTransaction();
    for (const sec of sections) {
      await conn.execute(`UPDATE sections SET position=?, updatedAt=NOW() WHERE id=?`, [
        sec.position,
        sec.id,
      ]);
    }
    await conn.commit();

    res.json({ message: "Sections reordered successfully" });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== SECTION ROWS ====================

// GET rows for a section
router.get("/section_rows", async (req, res) => {
  try {
    const sectionId = req.query.section_id;
    if (!sectionId) return res.status(400).json({ message: "section_id is required" });

    const [rows] = await conn.execute(
      `SELECT * FROM section_rows WHERE section_id=? ORDER BY position ASC`,
      [sectionId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add a new row
router.post("/section_rows", async (req, res) => {
  try {
    const { section_id, title, subtitle, button, content, mediaUrl, position } = req.body;
    if (!section_id || !title)
      return res.status(400).json({ message: "section_id and title are required" });

    const [result] = await conn.execute(
      `INSERT INTO section_rows (section_id, title, subtitle, button, content, mediaUrl, position) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        section_id,
        title,
        subtitle || "",
        button || "",
        content || "",
        mediaUrl || "",
        position || 0,
      ]
    );

    const [newRow] = await conn.execute("SELECT * FROM section_rows WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update row
router.put("/section_rows/:id", async (req, res) => {
  try {
    const { title, subtitle, button, content, mediaUrl, position } = req.body;
    const rowId = req.params.id;

    const [result] = await conn.execute(
      `UPDATE section_rows SET title=?, subtitle=?, button=?, content=?, mediaUrl=?, position=? WHERE id=?`,
      [title, subtitle || "", button || "", content || "", mediaUrl || "", position || 0, rowId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Row not found" });

    const [updated] = await conn.execute("SELECT * FROM section_rows WHERE id=?", [rowId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE row
router.delete("/section_rows/:id", async (req, res) => {
  try {
    const rowId = req.params.id;
    const [result] = await conn.execute("DELETE FROM section_rows WHERE id=?", [rowId]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Row not found" });

    res.json({ message: "Row deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, setConnection };
