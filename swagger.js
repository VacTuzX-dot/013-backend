import swaggerUi from "swagger-ui-express";

// Translations for Thai and English
const translations = {
  en: {
    title: "🚀 BackEnd API",
    description: `
# Welcome to the BackEnd API Documentation

This API provides comprehensive user management and authentication services.

## 🔐 How to Authenticate

### Step 1: Register (if you don't have an account)
Use \`POST /users\` to create a new account:
\`\`\`json
{
  "firstname": "Test",
  "fullname": "Test User", 
  "lastname": "User",
  "username": "testuser",
  "password": "password123"
}
\`\`\`

### Step 2: Login
Use \`POST /login\` with your credentials:
\`\`\`json
{
  "username": "testuser",
  "password": "password123"
}
\`\`\`

### Step 3: Authorize
1. Copy the \`token\` from login response
2. Click the **🔓 Authorize** button (top right)
3. Paste your token (without "Bearer " prefix)
4. Click **Authorize**

Now you can access protected endpoints! 🎉

## 📚 Quick Reference
| Action | Endpoint | Auth Required |
|--------|----------|---------------|
| Health Check | \`GET /ping\` | ❌ No |
| Register | \`POST /users\` | ❌ No |
| Login | \`POST /login\` | ❌ No |
| Logout | \`POST /logout\` | ✅ Yes |
| List Users | \`GET /users\` | ✅ Yes |
| Get User | \`GET /users/:id\` | ✅ Yes |
| Update User | \`PUT /users/:id\` | ✅ Yes |
| Delete User | \`DELETE /users/:id\` | ✅ Yes |

---
    `,
    externalDocs: "📖 Learn more about this API",
    tags: {
      health:
        "🏥 **Health Check Endpoints** — Monitor server and database status",
      auth: "🔐 **Authentication** — Login, logout, and session management",
      users: "👥 **User Management** — CRUD operations for user accounts",
      misc: "🔧 **Miscellaneous** — Other utility endpoints",
    },
    endpoints: {
      root: {
        summary: "Root endpoint",
        desc: "Returns the minimalist home page with API documentation link",
      },
      ping: {
        summary: "Test DB connection",
        desc: "Returns the current database server time to verify connectivity",
      },
      getAllUsers: {
        summary: "📋 Get all users",
        desc: "Retrieve a paginated list of all users. **🔒 Requires authentication** - Click Authorize button first!",
      },
      getUserById: {
        summary: "👤 Get user by ID",
        desc: "Retrieve a single user by their ID. **🔒 Requires authentication**",
      },
      createUser: {
        summary: "📝 Register new user",
        desc: "Create a new user account. **No authentication required** - Use this to create an account, then login!",
      },
      updateUser: {
        summary: "✏️ Update user",
        desc: "Update an existing user's information. **🔒 Requires authentication**",
      },
      deleteUser: {
        summary: "🗑️ Delete user",
        desc: "Delete a user by their ID. **🔒 Requires authentication**",
      },
      login: {
        summary: "🔑 User login",
        desc: "Authenticate with username and password to receive a JWT token. Use this token in the Authorize button to access protected endpoints.",
      },
      logout: {
        summary: "🚪 User logout",
        desc: "Invalidate the current user's session. **Requires authentication** - You must be logged in first.",
      },
      cors: {
        summary: "Test CORS endpoint",
        desc: "Simple endpoint to test CORS configuration",
      },
    },
    responses: {
      success: "✅ Success",
      unauthorized:
        "🔒 Unauthorized - Please login and use Authorize button first",
      notFound: "🔍 Not found",
      badRequest: "❌ Bad request",
      serverError: "❌ Server error",
    },
    params: {
      limit: "Number of users per page (max 100)",
      page: "Page number",
    },
    examples: {
      newUser: "Example new user",
      demo: "Demo credentials",
    },
    securityDesc:
      "**How to use:** \\n1. Login first using POST /login \\n2. Copy the `token` from response \\n3. Paste it here (without 'Bearer ' prefix) \\n4. Click Authorize",
  },
  th: {
    title: "🚀 BackEnd API",
    description: `
# ยินดีต้อนรับสู่เอกสาร API

API นี้ให้บริการจัดการผู้ใช้และระบบยืนยันตัวตนอย่างครบครัน

## 🔐 วิธีการยืนยันตัวตน

### ขั้นตอนที่ 1: สมัครสมาชิก (ถ้ายังไม่มีบัญชี)
ใช้ \`POST /users\` เพื่อสร้างบัญชีใหม่:
\`\`\`json
{
  "firstname": "ทดสอบ",
  "fullname": "ผู้ใช้ทดสอบ", 
  "lastname": "ระบบ",
  "username": "testuser",
  "password": "password123"
}
\`\`\`

### ขั้นตอนที่ 2: เข้าสู่ระบบ
ใช้ \`POST /login\` กับข้อมูลของคุณ:
\`\`\`json
{
  "username": "testuser",
  "password": "password123"
}
\`\`\`

### ขั้นตอนที่ 3: ยืนยันสิทธิ์
1. คัดลอก \`token\` จากผลลัพธ์การเข้าสู่ระบบ
2. คลิกปุ่ม **🔓 Authorize** (มุมบนขวา)
3. วาง token ของคุณ (ไม่ต้องใส่ "Bearer ")
4. คลิก **Authorize**

ตอนนี้คุณสามารถเข้าถึง endpoint ที่ต้องยืนยันตัวตนได้แล้ว! 🎉

## 📚 อ้างอิงด่วน
| การกระทำ | Endpoint | ต้องยืนยันตัวตน |
|--------|----------|-----------------|
| ตรวจสอบสถานะ | \`GET /ping\` | ❌ ไม่ต้อง |
| สมัครสมาชิก | \`POST /users\` | ❌ ไม่ต้อง |
| เข้าสู่ระบบ | \`POST /login\` | ❌ ไม่ต้อง |
| ออกจากระบบ | \`POST /logout\` | ✅ ต้อง |
| ดูผู้ใช้ทั้งหมด | \`GET /users\` | ✅ ต้อง |
| ดูผู้ใช้ตาม ID | \`GET /users/:id\` | ✅ ต้อง |
| แก้ไขผู้ใช้ | \`PUT /users/:id\` | ✅ ต้อง |
| ลบผู้ใช้ | \`DELETE /users/:id\` | ✅ ต้อง |

---
    `,
    externalDocs: "📖 เรียนรู้เพิ่มเติมเกี่ยวกับ API นี้",
    tags: {
      health: "🏥 **ตรวจสอบสถานะ** — ตรวจสอบสถานะเซิร์ฟเวอร์และฐานข้อมูล",
      auth: "🔐 **ยืนยันตัวตน** — เข้าสู่ระบบ, ออกจากระบบ และจัดการเซสชัน",
      users: "👥 **จัดการผู้ใช้** — สร้าง อ่าน แก้ไข ลบ บัญชีผู้ใช้",
      misc: "🔧 **อื่นๆ** — endpoint อื่นๆ",
    },
    endpoints: {
      root: {
        summary: "หน้าหลัก",
        desc: "แสดงหน้าหลักพร้อมลิงก์ไปยังเอกสาร API",
      },
      ping: {
        summary: "ทดสอบการเชื่อมต่อ DB",
        desc: "คืนค่าเวลาปัจจุบันของเซิร์ฟเวอร์ฐานข้อมูลเพื่อยืนยันการเชื่อมต่อ",
      },
      getAllUsers: {
        summary: "📋 ดูผู้ใช้ทั้งหมด",
        desc: "ดึงรายชื่อผู้ใช้แบบแบ่งหน้า **🔒 ต้องยืนยันตัวตน** - คลิกปุ่ม Authorize ก่อน!",
      },
      getUserById: {
        summary: "👤 ดูผู้ใช้ตาม ID",
        desc: "ดึงข้อมูลผู้ใช้คนเดียวตาม ID **🔒 ต้องยืนยันตัวตน**",
      },
      createUser: {
        summary: "📝 สมัครสมาชิกใหม่",
        desc: "สร้างบัญชีผู้ใช้ใหม่ **ไม่ต้องยืนยันตัวตน** - ใช้สร้างบัญชีแล้วเข้าสู่ระบบ!",
      },
      updateUser: {
        summary: "✏️ แก้ไขผู้ใช้",
        desc: "อัปเดตข้อมูลผู้ใช้ที่มีอยู่ **🔒 ต้องยืนยันตัวตน**",
      },
      deleteUser: {
        summary: "🗑️ ลบผู้ใช้",
        desc: "ลบผู้ใช้ตาม ID **🔒 ต้องยืนยันตัวตน**",
      },
      login: {
        summary: "🔑 เข้าสู่ระบบ",
        desc: "ยืนยันตัวตนด้วย username และ password เพื่อรับ JWT token จากนั้นใช้ token ในปุ่ม Authorize เพื่อเข้าถึง endpoint ที่ต้องยืนยันตัวตน",
      },
      logout: {
        summary: "🚪 ออกจากระบบ",
        desc: "ยกเลิกเซสชันของผู้ใช้ปัจจุบัน **ต้องยืนยันตัวตน** - คุณต้องเข้าสู่ระบบก่อน",
      },
      cors: {
        summary: "ทดสอบ CORS",
        desc: "endpoint ง่ายๆ สำหรับทดสอบการตั้งค่า CORS",
      },
    },
    responses: {
      success: "✅ สำเร็จ",
      unauthorized:
        "🔒 ไม่ได้รับอนุญาต - กรุณาเข้าสู่ระบบและใช้ปุ่ม Authorize ก่อน",
      notFound: "🔍 ไม่พบข้อมูล",
      badRequest: "❌ คำขอไม่ถูกต้อง",
      serverError: "❌ เซิร์ฟเวอร์ผิดพลาด",
    },
    params: {
      limit: "จำนวนผู้ใช้ต่อหน้า (สูงสุด 100)",
      page: "หมายเลขหน้า",
    },
    examples: {
      newUser: "ตัวอย่างผู้ใช้ใหม่",
      demo: "ข้อมูลตัวอย่าง",
    },
    securityDesc:
      "**วิธีใช้:** \\n1. เข้าสู่ระบบด้วย POST /login \\n2. คัดลอก `token` จากผลลัพธ์ \\n3. วางที่นี่ (ไม่ต้องใส่ 'Bearer ') \\n4. คลิก Authorize",
  },
};

// Function to generate spec for a specific language
function generateSpec(lang = "en") {
  const t = translations[lang] || translations.en;
  return {
    openapi: "3.0.0",
    info: {
      title: t.title,
      version: "1.0.0",
      description: t.description,
      contact: { name: "API Support", email: "taweesaknumma@gmail.com" },
      license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
    },
    externalDocs: {
      description: t.externalDocs,
      url: "https://github.com/VacTuzX-dot/013-backend",
    },
    servers: [
      {
        url: "https://013-backend.vercel.app",
        description:
          lang === "th" ? "🌐 เซิร์ฟเวอร์ Production" : "🌐 Production Server",
      },
      {
        url: "http://localhost:3000",
        description:
          lang === "th"
            ? "🖥️ เซิร์ฟเวอร์ Development"
            : "🖥️ Development Server",
      },
    ],
    tags: [
      { name: "Health", description: t.tags.health },
      { name: "Authentication", description: t.tags.auth },
      { name: "Users", description: t.tags.users },
      { name: "Misc", description: t.tags.misc },
    ],
    paths: {
      "/": {
        get: {
          tags: ["Health"],
          summary: t.endpoints.root.summary,
          description: t.endpoints.root.desc,
          responses: {
            200: {
              description: t.responses.success,
              content: { "text/html": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/ping": {
        get: {
          tags: ["Health"],
          summary: t.endpoints.ping.summary,
          description: t.endpoints.ping.desc,
          responses: {
            200: {
              description: t.responses.success,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      time: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
            500: { description: t.responses.serverError },
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: t.endpoints.getAllUsers.summary,
          description: t.endpoints.getAllUsers.desc,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "limit",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 10,
              },
              description: t.params.limit,
            },
            {
              in: "query",
              name: "page",
              schema: { type: "integer", minimum: 1, default: 1 },
              description: t.params.page,
            },
          ],
          responses: {
            200: {
              description: t.responses.success,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      count: { type: "integer" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
                      total: { type: "integer" },
                      page: { type: "integer" },
                      limit: { type: "integer" },
                    },
                  },
                },
              },
            },
            401: { description: t.responses.unauthorized },
            500: { description: t.responses.serverError },
          },
        },
        post: {
          tags: ["Users"],
          summary: t.endpoints.createUser.summary,
          description: t.endpoints.createUser.desc,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserInput" },
                examples: {
                  newUser: {
                    summary: t.examples.newUser,
                    value: {
                      firstname: "John",
                      fullname: "John Doe",
                      lastname: "Doe",
                      username: "johndoe",
                      password: "password123",
                      status: "active",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: t.responses.success },
            400: { description: t.responses.badRequest },
            500: { description: t.responses.serverError },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          summary: t.endpoints.getUserById.summary,
          description: t.endpoints.getUserById.desc,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "User ID",
            },
          ],
          responses: {
            200: { description: t.responses.success },
            401: { description: t.responses.unauthorized },
            404: { description: t.responses.notFound },
            500: { description: t.responses.serverError },
          },
        },
        put: {
          tags: ["Users"],
          summary: t.endpoints.updateUser.summary,
          description: t.endpoints.updateUser.desc,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "User ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    firstname: { type: "string" },
                    fullname: { type: "string" },
                    lastname: { type: "string" },
                    username: { type: "string" },
                    password: { type: "string" },
                    status: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: t.responses.success },
            400: { description: t.responses.badRequest },
            401: { description: t.responses.unauthorized },
            404: { description: t.responses.notFound },
            500: { description: t.responses.serverError },
          },
        },
        delete: {
          tags: ["Users"],
          summary: t.endpoints.deleteUser.summary,
          description: t.endpoints.deleteUser.desc,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "User ID",
            },
          ],
          responses: {
            200: { description: t.responses.success },
            401: { description: t.responses.unauthorized },
            404: { description: t.responses.notFound },
            500: { description: t.responses.serverError },
          },
        },
      },
      "/login": {
        post: {
          tags: ["Authentication"],
          summary: t.endpoints.login.summary,
          description: t.endpoints.login.desc,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
                examples: {
                  demo: {
                    summary: t.examples.demo,
                    value: { username: "testuser", password: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: t.responses.success,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Login successful" },
                      token: { type: "string", description: "JWT token" },
                    },
                  },
                },
              },
            },
            400: { description: t.responses.badRequest },
            401: { description: t.responses.unauthorized },
            500: { description: t.responses.serverError },
          },
        },
      },
      "/logout": {
        post: {
          tags: ["Authentication"],
          summary: t.endpoints.logout.summary,
          description: t.endpoints.logout.desc,
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: t.responses.success },
            401: { description: t.responses.unauthorized },
          },
        },
      },
      "/api/data": {
        get: {
          tags: ["Misc"],
          summary: t.endpoints.cors.summary,
          description: t.endpoints.cors.desc,
          responses: { 200: { description: t.responses.success } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: t.securityDesc,
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            firstname: { type: "string", example: "John" },
            fullname: { type: "string", example: "John Doe" },
            lastname: { type: "string", example: "Doe" },
            username: { type: "string", example: "johndoe" },
            status: { type: "string", example: "active" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        UserInput: {
          type: "object",
          required: [
            "firstname",
            "fullname",
            "lastname",
            "username",
            "password",
          ],
          properties: {
            firstname: { type: "string", example: "John" },
            fullname: { type: "string", example: "John Doe" },
            lastname: { type: "string", example: "Doe" },
            username: { type: "string", example: "johndoe" },
            password: { type: "string", example: "password123" },
            status: { type: "string", example: "active", default: "active" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "johndoe" },
            password: { type: "string", example: "password123" },
          },
        },
      },
    },
  };
}

// Default English spec for backward compatibility
const specs = generateSpec("en");

export { swaggerUi, specs, generateSpec };
