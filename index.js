import express from "express";
import cors from "cors";
import compression from "compression";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "./middleware/auth.js";
import { specs, generateSpec } from "./swagger.js";
import { db, POOL_SIZE, DB_NAME } from "./config/db.js";
import { runQuery, sendDbError, requireFields } from "./utils/helpers.js";
import usersRouter from "./routes/users.js";

const SECRET_KEY = process.env.JWT_SECRET;
const activeTokens =
  globalThis.__activeTokens ?? (globalThis.__activeTokens = new Map());

function setActiveToken(userId, token) {
  activeTokens.set(userId, token);
}

function clearActiveToken(userId) {
  activeTokens.delete(userId);
}

// --------------------------------------------------
// 1) CONFIG / SERVER TUNING
// --------------------------------------------------

export const app = express();

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve favicon
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "njz.png"), {
    headers: { "Content-Type": "image/x-icon" },
  });
});

// Swagger UI setup - Vercel serverless compatible using CDN
// Generate HTML with CDN links since Vercel can't serve static files from node_modules
app.get("/api-docs", (req, res) => {
  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BackEnd API Documentation</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
    
    .lang-switcher {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      display: flex;
      gap: 8px;
      background: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .lang-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;
    }
    
    .lang-btn.active {
      background: #49cc90;
      color: white;
    }
    
    .lang-btn:not(.active) {
      background: #f4f4f5;
      color: #333;
    }
    
    .lang-btn:not(.active):hover {
      background: #e4e4e7;
    }
    
    .loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .loading.hidden {
      opacity: 0;
      visibility: hidden;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-text {
      color: #fff;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    .loading-subtitle {
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div id="loading" class="loading">
    <div class="spinner"></div>
    <div class="loading-text">Loading API Documentation</div>
    <div class="loading-subtitle">Please wait...</div>
  </div>
  <div class="lang-switcher">
    <button id="btn-en" class="lang-btn" onclick="switchLang('en')">🇺🇸 EN</button>
    <button id="btn-th" class="lang-btn" onclick="switchLang('th')">🇹🇭 TH</button>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    let swaggerUI = null;
    let isInitialLoad = true;
    
    // Get saved language from localStorage or default to 'en'
    function getSavedLang() {
      return localStorage.getItem('api-docs-lang') || 'en';
    }
    
    // Save language to localStorage
    function saveLang(lang) {
      localStorage.setItem('api-docs-lang', lang);
    }
    
    // Update button states
    function updateButtons(lang) {
      document.getElementById('btn-en').classList.toggle('active', lang === 'en');
      document.getElementById('btn-th').classList.toggle('active', lang === 'th');
      document.documentElement.lang = lang;
    }
    
    // Load Swagger spec for given language
    async function loadSpec(lang) {
      const response = await fetch('/api-docs/spec?lang=' + lang);
      return response.json();
    }
    
    // Initialize or reinitialize SwaggerUI
    async function initSwagger(lang, preserveScroll = false) {
      const loading = document.getElementById('loading');
      
      // Only show loading on initial page load
      if (isInitialLoad) {
        loading.classList.remove('hidden');
      }
      
      // Save current scroll position if preserving
      const scrollY = preserveScroll ? window.scrollY : 0;
      
      try {
        const spec = await loadSpec(lang);
        
        // Clear existing swagger-ui content
        document.getElementById('swagger-ui').innerHTML = '';
        
        swaggerUI = SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          deepLinking: true,
          persistAuthorization: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout"
        });
        
        updateButtons(lang);
        saveLang(lang);
        
        // Restore scroll position after a small delay to let Swagger render
        if (preserveScroll) {
          setTimeout(() => {
            window.scrollTo(0, scrollY);
          }, 100);
        }
      } catch (err) {
        console.error('Failed to load spec:', err);
      } finally {
        loading.classList.add('hidden');
        isInitialLoad = false;
      }
    }
    
    // Switch language without page refresh, preserve scroll position
    function switchLang(lang) {
      if (getSavedLang() === lang) return;
      initSwagger(lang, true);
    }
    
    // Initialize on page load
    window.onload = function() {
      const savedLang = getSavedLang();
      initSwagger(savedLang);
    };
  </script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html");
  res.send(swaggerHtml);
});

// API endpoint to serve spec in different languages
app.get("/api-docs/spec", (req, res) => {
  const lang = req.query.lang === "th" ? "th" : "en";
  const spec = generateSpec(lang);
  res.json(spec);
});

app.disable("x-powered-by");
app.set("etag", "strong");

// Enable gzip compression for all responses
app.use(compression());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "64kb" }));

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE || "100", 10);

// log env summary (no secrets)
console.log("[DB CONFIG]", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: DB_NAME,
  port: process.env.DB_PORT ?? 3306,
  poolSize: POOL_SIZE,
  bcryptRounds: BCRYPT_ROUNDS,
});

// --------------------------------------------------
// 2) ROUTES
// --------------------------------------------------

/**
 * @openapi
 * /ping:
 *   get:
 *     tags:
 *       - Health
 *     summary: Test DB connection
 *     description: Returns the current database server time to verify connectivity
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 time:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Database error
 */
app.get("/ping", async (req, res) => {
  try {
    const rows = await runQuery("SELECT NOW() AS now");
    res.json({
      status: "ok",
      time: rows[0].now,
    });
  } catch (err) {
    return sendDbError(res, err);
  }
});

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: Root endpoint
 *     description: Returns the minimalist home page with API documentation link
 *     responses:
 *       200:
 *         description: Home page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get("/", (req, res) => {
  const homeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VacTuz API</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #fafafa;
      --text: #0a0a0a;
      --text-muted: #52525b;
      --border: #e4e4e7;
      --border-hover: #a1a1aa;
      --btn-bg: #0a0a0a;
      --btn-text: #fafafa;
      --btn-secondary-bg: transparent;
      --btn-secondary-hover: #f4f4f5;
      --shadow: rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a0a0a;
        --text: #fafafa;
        --text-muted: #a1a1aa;
        --border: #27272a;
        --border-hover: #3f3f46;
        --btn-bg: #fafafa;
        --btn-text: #0a0a0a;
        --btn-secondary-bg: transparent;
        --btn-secondary-hover: #18181b;
        --shadow: rgba(255, 255, 255, 0.1);
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      transition: background 0.3s ease, color 0.3s ease;
    }
    
    .container {
      max-width: 600px;
      text-align: center;
    }
    
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 9999px;
      font-size: 0.875rem;
      color: #22c55e;
      margin-bottom: 2rem;
    }
    
    .status::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
    }
    
    .description {
      font-size: 1.125rem;
      font-weight: 300;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 2.5rem;
    }
    
    .links {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: var(--btn-bg);
      color: var(--btn-text);
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.9375rem;
      transition: all 0.2s ease;
    }
    
    .link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--shadow);
    }
    
    .link-secondary {
      background: var(--btn-secondary-bg);
      color: var(--text);
      border: 1px solid var(--border);
    }
    
    .link-secondary:hover {
      background: var(--btn-secondary-hover);
      border-color: var(--border-hover);
    }
    
    .footer {
      position: fixed;
      bottom: 2rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="status">Online</div>
    <h1>VacTuz API</h1>
    <p class="description">
      A RESTful backend service providing authentication, user management, 
      and data operations. Built with Express.js and MySQL for reliable 
      and scalable performance.
    </p>
    <div class="links">
      <a href="/api-docs" class="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        API Documentation
      </a>
      <a href="/ping" class="link link-secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        Health Check
      </a>
    </div>
  </div>
  <div class="footer">© 2025 VacTuz</div>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html");
  res.send(homeHtml);
});

// Users routes
app.use("/api/users", usersRouter);

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user and receive a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const missing = requireFields({ username, password }, [
    "username",
    "password",
  ]);
  if (missing) {
    return res.status(400).json({
      error: `Missing required field: ${missing}`,
    });
  }

  try {
    const [rows] = await db.execute(
      "SELECT id, fullname, lastname, password FROM tbl_users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, fullname: user.fullname, lastname: user.lastname },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    setActiveToken(user.id, token);

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * @openapi
 * /logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: Invalidate the current user's session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Logged out
 *       401:
 *         description: Unauthorized
 */
app.post("/logout", verifyToken, (req, res) => {
  clearActiveToken(req.user.id);
  res.json({ status: "ok", message: "Logged out" });
});

/**
 * @openapi
 * /api/data:
 *   get:
 *     tags:
 *       - Misc
 *     summary: Test CORS endpoint
 *     description: Simple endpoint to test CORS configuration
 *     responses:
 *       200:
 *         description: CORS test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello, CORS!
 */
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello, CORS!" });
});

// --------------------------------------------------
// 3) GLOBAL FALLBACK ERROR HANDLER
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error("[UNCAUGHT ERROR]", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// --------------------------------------------------
// 4) START SERVER & GRACEFUL SHUTDOWN
// --------------------------------------------------
const PORT = process.env.PORT || 3000;
let server;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });

  // Graceful shutdown handler
  const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      console.log("📴 HTTP server closed");

      try {
        await db.end();
        console.log("🗄️ Database connections closed");
      } catch (err) {
        console.error("Error closing database:", err);
      }

      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

export default app;
