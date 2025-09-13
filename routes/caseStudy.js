const express = require("express");
const router = express.Router();

let conn;

// Set DB connection
function setConnection(dbConn) {
  conn = dbConn;
}

// ==================== Case Study ====================

// GET all case/study
router.get("/case_study", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM case_study ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single case/study by ID
router.get("/case_study/:id", async (req, res) => {
  try {
    const [rows] = await conn.execute("SELECT * FROM case_study WHERE id=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create case/study
router.post("/case_study", async (req, res) => {
  try {
    const { imageUrl, title, subtitle, description, link, date } = req.body;
    if (!imageUrl || !title || !date)
      return res.status(400).json({ message: "imageUrl, title and date are required" });

    const [result] = await conn.execute(
      `INSERT INTO case_study (imageUrl, title, subtitle, description, link, date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [imageUrl, title, subtitle || "", description || "", link || "", date]
    );

    const [newRow] = await conn.execute("SELECT * FROM case_study WHERE id=?", [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update case/study
router.put("/case_study/:id", async (req, res) => {
  try {
    const { imageUrl, title, subtitle, description, link, date } = req.body;

    const [result] = await conn.execute(
      `UPDATE case_study 
       SET imageUrl=?, title=?, subtitle=?, description=?, link=?, date=?, updatedAt=NOW() 
       WHERE id=?`,
      [imageUrl, title, subtitle || "", description || "", link || "", date, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

    const [updated] = await conn.execute("SELECT * FROM case_study WHERE id=?", [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE case/study
router.delete("/case_study/:id", async (req, res) => {
  try {
    const [result] = await conn.execute("DELETE FROM case_study WHERE id=?", [req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, setConnection };
