const express = require("express");
const router = express.Router();
const pool = require("../db");
const generateCode = require("../utils/generateCode");

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// CREATE LINK
router.post("/", async (req, res) => {
  const { target_url, code } = req.body;

  if (!target_url) {
    return res.status(400).json({ error: "Target URL required" });
  }

  try {
    new URL(target_url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let shortCode = code || generateCode();

  if (!CODE_REGEX.test(shortCode)) {
    return res.status(400).json({ error: "Invalid code format" });
  }

  try {
    await pool.query(
      "INSERT INTO links (code, target_url) VALUES ($1,$2)",
      [shortCode, target_url]
    );

    res.status(201).json({ code: shortCode });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Code already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// LIST ALL LINKS
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM links ORDER BY created_at DESC");
  res.json(result.rows);
});

// GET STATS
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);

  if (!result.rows.length) return res.status(404).json({ error: "Not found" });

  res.json(result.rows[0]);
});

// DELETE
router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("DELETE FROM links WHERE code=$1", [code]);

  if (!result.rowCount) return res.status(404).json({ error: "Not found" });

  res.json({ success: true });
});

module.exports = router;
