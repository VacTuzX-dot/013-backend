import mysql from "mysql2/promise";
import { config as loadEnv } from "dotenv";

const envPath =
  process.env.DOTENV_CONFIG_PATH ??
  (process.env.NODE_ENV === "production" ? ".env.production" : ".env.local");

loadEnv({ path: envPath, override: false });

// Optimized pool settings for handling multiple concurrent users
const POOL_SIZE = parseInt(process.env.DB_POOL_SIZE || "50", 10);
const DB_NAME = process.env.DB_NAME || "db_shop";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: DB_NAME,
  port: process.env.DB_PORT ?? 3306,
  waitForConnections: true,
  connectionLimit: POOL_SIZE,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Connection timeout settings
  connectTimeout: 10000,
  // Idle connection timeout (release idle connections)
  idleTimeout: 60000,
});

export { db, POOL_SIZE, DB_NAME };
