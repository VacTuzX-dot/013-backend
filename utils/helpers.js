import { db } from "../config/db.js";

/**
 * Execute a SQL query with optional parameters
 * Uses db.query for simple queries, db.execute for prepared statements
 */
export async function runQuery(sql, params = []) {
  if (params.length === 0) {
    const [rows] = await db.query(sql);
    return rows;
  } else {
    const [rows] = await db.execute(sql, params);
    return rows;
  }
}

/**
 * Send a standardized database error response
 */
export function sendDbError(res, err, httpCode = 500) {
  console.error("[DB ERROR]", err);
  return res.status(httpCode).json({
    status: "error",
    message: err?.message ?? "Database error",
    code: err?.code ?? null,
  });
}

/**
 * Check if required fields are present in an object
 * Returns the first missing field name, or null if all present
 */
export function requireFields(obj, keys) {
  for (const k of keys) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === "") {
      return k;
    }
  }
  return null;
}
