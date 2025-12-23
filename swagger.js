import swaggerUi from "swagger-ui-express";

// Define OpenAPI spec directly (no file reading needed - works on Vercel)
const specs = {
  openapi: "3.0.0",
  info: {
    title: "🚀 BackEnd API",
    version: "1.0.0",
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
    contact: {
      name: "API Support",
      email: "taweesaknumma@gmail.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  externalDocs: {
    description: "📖 Learn more about this API",
    url: "https://github.com/VacTuzX-dot/013-backend",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "🖥️ Development Server",
    },
    {
      url: "https://013-backend.vercel.app",
      description: "🌐 Production Server",
    },
  ],
  tags: [
    {
      name: "Health",
      description:
        "🏥 **Health Check Endpoints** — Monitor server and database status",
    },
    {
      name: "Authentication",
      description:
        "🔐 **Authentication** — Login, logout, and session management",
    },
    {
      name: "Users",
      description: "👥 **User Management** — CRUD operations for user accounts",
    },
    {
      name: "Misc",
      description: "🔧 **Miscellaneous** — Other utility endpoints",
    },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Root endpoint",
        description: "Returns a simple message to confirm server is running",
        responses: {
          200: {
            description: "Server is running",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example:
                    "✅ Server is running on cloud. Go to /ping to check its status.",
                },
              },
            },
          },
        },
      },
    },
    "/ping": {
      get: {
        tags: ["Health"],
        summary: "Test DB connection",
        description:
          "Returns the current database server time to verify connectivity",
        responses: {
          200: {
            description: "Database connection successful",
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
          500: { description: "Database error" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "📋 Get all users",
        description:
          "Retrieve a paginated list of all users. **🔒 Requires authentication** - Click Authorize button first!",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            description: "Number of users per page (max 100)",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
        ],
        responses: {
          200: {
            description: "✅ List of users retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    count: { type: "integer", example: 5 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                    total: { type: "integer", example: 100 },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 10 },
                  },
                },
              },
            },
          },
          401: {
            description:
              "🔒 Unauthorized - Please login and use Authorize button first",
          },
          500: { description: "❌ Database error" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "📝 Register new user",
        description:
          "Create a new user account. **No authentication required** - Use this to create an account, then login!",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
              examples: {
                newUser: {
                  summary: "Example new user",
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
          201: {
            description: "✅ User created successfully - Now you can login!",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    id: { type: "integer", example: 1 },
                    firstname: { type: "string", example: "John" },
                    fullname: { type: "string", example: "John Doe" },
                    lastname: { type: "string", example: "Doe" },
                    username: { type: "string", example: "johndoe" },
                    status: {
                      type: "string",
                      example: "active",
                      description: "User account status",
                    },
                  },
                },
              },
            },
          },
          400: { description: "❌ Bad request - Missing required fields" },
          500: {
            description: "❌ Database error (possibly duplicate username)",
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        description: "Retrieve a single user by their ID",
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
          200: {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
          500: { description: "Database error" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update an existing user's information",
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
          200: {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: {
                      type: "string",
                      example: "User updated successfully",
                    },
                  },
                },
              },
            },
          },
          400: { description: "No fields to update" },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
          500: { description: "Database error" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Delete a user by their ID",
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
          200: {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: {
                      type: "string",
                      example: "User deleted successfully",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
          500: { description: "Database error" },
        },
      },
    },
    "/login": {
      post: {
        tags: ["Authentication"],
        summary: "🔑 User login",
        description:
          "Authenticate with username and password to receive a JWT token. Use this token in the Authorize button to access protected endpoints.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
              examples: {
                demo: {
                  summary: "Demo credentials",
                  value: {
                    username: "testuser",
                    password: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              "✅ Login successful - Copy the token and use it in Authorize button",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login successful" },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      description:
                        "JWT token - Copy this and paste in Authorize button (valid for 1 hour)",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "❌ Missing required fields (username or password)",
          },
          401: {
            description:
              "❌ Invalid credentials - User not found or wrong password",
          },
          500: { description: "❌ Login failed - Server error" },
        },
      },
    },
    "/logout": {
      post: {
        tags: ["Authentication"],
        summary: "🚪 User logout",
        description:
          "Invalidate the current user's session. **Requires authentication** - You must be logged in first.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "✅ Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "Logged out" },
                  },
                },
              },
            },
          },
          401: {
            description: "🔒 Unauthorized - Please login and authorize first",
          },
        },
      },
    },
    "/api/data": {
      get: {
        tags: ["Misc"],
        summary: "Test CORS endpoint",
        description: "Simple endpoint to test CORS configuration",
        responses: {
          200: {
            description: "CORS test successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Hello, CORS!" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "**How to use:** \n1. Login first using POST /login \n2. Copy the `token` from response \n3. Paste it here (without 'Bearer ' prefix) \n4. Click Authorize",
      },
    },
    schemas: {
      User: {
        type: "object",
        description: "User account information (without sensitive data)",
        properties: {
          id: {
            type: "integer",
            example: 1,
            description: "Unique user identifier",
          },
          firstname: {
            type: "string",
            example: "John",
            description: "User's first name",
          },
          fullname: {
            type: "string",
            example: "John Doe",
            description: "User's full display name",
          },
          lastname: {
            type: "string",
            example: "Doe",
            description: "User's last name",
          },
          username: {
            type: "string",
            example: "johndoe",
            description: "Unique username for login",
          },
          status: {
            type: "string",
            example: "active",
            enum: ["active", "inactive", "suspended"],
            description: "Account status",
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
          },
          updated_at: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
        },
      },
      UserInput: {
        type: "object",
        description: "Required fields for creating a new user",
        required: ["firstname", "fullname", "lastname", "username", "password"],
        properties: {
          firstname: {
            type: "string",
            example: "John",
            minLength: 1,
            maxLength: 50,
            description: "User's first name",
          },
          fullname: {
            type: "string",
            example: "John Doe",
            minLength: 1,
            maxLength: 100,
            description: "User's full display name",
          },
          lastname: {
            type: "string",
            example: "Doe",
            minLength: 1,
            maxLength: 50,
            description: "User's last name",
          },
          username: {
            type: "string",
            example: "johndoe",
            minLength: 3,
            maxLength: 30,
            description: "Unique username for login (3-30 characters)",
          },
          password: {
            type: "string",
            example: "password123",
            minLength: 6,
            description: "Password (minimum 6 characters)",
          },
          status: {
            type: "string",
            example: "active",
            default: "active",
            enum: ["active", "inactive"],
            description: "Account status (defaults to 'active')",
          },
        },
      },
      LoginInput: {
        type: "object",
        description: "Credentials for user authentication",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            example: "johndoe",
            description: "Your registered username",
          },
          password: {
            type: "string",
            example: "password123",
            description: "Your account password",
          },
        },
      },
      LoginResponse: {
        type: "object",
        description: "Successful login response with JWT token",
        properties: {
          message: { type: "string", example: "Login successful" },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            description: "JWT token valid for 1 hour",
          },
        },
      },
      SuccessResponse: {
        type: "object",
        description: "Generic success response",
        properties: {
          status: { type: "string", example: "ok" },
          message: {
            type: "string",
            example: "Operation completed successfully",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        description: "Error response structure",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "An error occurred" },
          code: {
            type: "string",
            nullable: true,
            example: "ER_DUP_ENTRY",
            description: "Error code (if available)",
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "🔒 Authentication required or invalid token",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "string", example: "No token provided" },
              },
            },
          },
        },
      },
      NotFound: {
        description: "🔍 Resource not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "not_found" },
                message: { type: "string", example: "User not found" },
              },
            },
          },
        },
      },
      ServerError: {
        description: "💥 Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
};

export { swaggerUi, specs };
