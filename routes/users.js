import express from "express";
import bcrypt from "bcrypt";
import verifyToken from "../middleware/auth.js";
import { db } from "../config/db.js";
import { runQuery, sendDbError, requireFields } from "../utils/helpers.js";

const router = express.Router();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE || "100", 10);

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const limitParam = Number.parseInt(req.query.limit ?? "", 10);
    const limit =
      Number.isNaN(limitParam) || limitParam <= 0
        ? null
        : Math.min(limitParam, MAX_PAGE_SIZE);

    const pageParam = Number.parseInt(req.query.page ?? "", 10);
    const page = Number.isNaN(pageParam) || pageParam <= 0 ? 1 : pageParam;
    const offset = limit !== null ? Math.max(0, (page - 1) * limit) : 0;

    let sql =
      "SELECT id, firstname, fullname, lastname, username, status, created_at, updated_at FROM tbl_users";
    if (limit !== null) {
      // Use string interpolation for LIMIT/OFFSET since mysql2 prepared statements
      // can have issues with integer parameters
      sql += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    }

    const dataPromise = runQuery(sql);
    const countPromise =
      limit !== null
        ? runQuery("SELECT COUNT(*) AS total FROM tbl_users")
        : null;

    const rows = await dataPromise;
    const responseBody = {
      status: "ok",
      count: rows.length,
      data: rows,
    };

    if (countPromise) {
      const total = await countPromise;
      responseBody.total = total[0].total;
      responseBody.page = page;
      responseBody.limit = limit;
    }

    res.json(responseBody);
  } catch (err) {
    return sendDbError(res, err);
  }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a single user by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await runQuery(
      "SELECT id, firstname, fullname, lastname, username, status, created_at, updated_at FROM tbl_users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "not_found", message: "User not found" });
    }

    res.json({
      status: "ok",
      data: rows[0],
    });
  } catch (err) {
    return sendDbError(res, err);
  }
});

/**
 * @openapi
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 id:
 *                   type: integer
 *                 firstname:
 *                   type: string
 *                 fullname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 username:
 *                   type: string
 *                 userStatus:
 *                   type: string
 *                   description: User account status (e.g., active, inactive)
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Database error
 */
router.post("/", async (req, res) => {
  try {
    const {
      firstname,
      fullname,
      lastname,
      username,
      password,
      status = "active",
    } = req.body;

    const missing = requireFields(req.body, [
      "firstname",
      "fullname",
      "lastname",
      "username",
      "password",
    ]);
    if (missing) {
      return res.status(400).json({
        status: "bad_request",
        message: `Missing required field: ${missing}`,
      });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const [result] = await db.execute(
      `
        INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [firstname, fullname, lastname, username, hashed, status]
    );

    res.status(201).json({
      status: "ok",
      id: result.insertId,
      firstname,
      fullname,
      lastname,
      username,
      status,
    });
  } catch (err) {
    return sendDbError(res, err);
  }
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update an existing user's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               fullname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, fullname, lastname, username, password, status } =
      req.body;

    // dynamic fields
    const fields = [];
    const params = [];

    if (firstname !== undefined) {
      fields.push("firstname = ?");
      params.push(firstname);
    }
    if (fullname !== undefined) {
      fields.push("fullname = ?");
      params.push(fullname);
    }
    if (lastname !== undefined) {
      fields.push("lastname = ?");
      params.push(lastname);
    }
    if (username !== undefined) {
      fields.push("username = ?");
      params.push(username);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      params.push(status);
    }
    if (password !== undefined) {
      const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
      fields.push("password = ?");
      params.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        status: "bad_request",
        message: "No fields to update",
      });
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");

    const [result] = await db.execute(
      `UPDATE tbl_users SET ${fields.join(", ")} WHERE id = ?`,
      [...params, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "not_found", message: "User not found" });
    }

    res.json({
      status: "ok",
      message: "User updated successfully",
    });
  } catch (err) {
    return sendDbError(res, err);
  }
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM tbl_users WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "not_found", message: "User not found" });
    }

    res.json({
      status: "ok",
      message: "User deleted successfully",
    });
  } catch (err) {
    return sendDbError(res, err);
  }
});

export default router;
