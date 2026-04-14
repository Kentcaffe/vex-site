require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query, pool } = require("./db");
const { initDb } = require("./init-db");
const { requireAuth } = require("./auth-middleware");

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 3000);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables.");
}

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required.",
      });
    }

    const existing = await query(
      "SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1",
      [email.toLowerCase().trim(), username.trim()]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        error: "User with this email or username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const createdUser = await query(
      `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
      `,
      [username.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    return res.status(201).json(createdUser.rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to register user.",
      details: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    const userResult = await query(
      "SELECT id, username, email, password, created_at FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to login.",
      details: error.message,
    });
  }
});

app.post("/api/ads", requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "title and description are required." });
    }

    const adResult = await query(
      `
      INSERT INTO ads (user_id, title, description)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, title, description, created_at
      `,
      [req.user.id, title.trim(), description.trim()]
    );

    return res.status(201).json(adResult.rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create ad.",
      details: error.message,
    });
  }
});

app.get("/api/ads", async (_req, res) => {
  try {
    const adsResult = await query(
      `
      SELECT
        ads.id,
        ads.title,
        ads.description,
        ads.created_at,
        users.id AS user_id,
        users.username,
        users.email
      FROM ads
      INNER JOIN users ON users.id = ads.user_id
      ORDER BY ads.created_at DESC
      `
    );

    return res.json(adsResult.rows);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to list ads.",
      details: error.message,
    });
  }
});

async function start() {
  await initDb();
  app.listen(port, () => {
    console.log(`Backend API running at http://localhost:${port}`);
  });
}

start()
  .catch((error) => {
    console.error("Failed to start backend:", error);
    process.exit(1);
  })
  .finally(async () => {
    if (process.env.NODE_ENV === "test") {
      await pool.end();
    }
  });
