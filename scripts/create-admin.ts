import { neon } from "@neondatabase/serverless";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const sql = neon(process.env.DATABASE_URL!);
const scryptAsync = promisify(scrypt);

// Hash password using scrypt (Better Auth default)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

// Generate random ID
function generateId(): string {
  return randomBytes(16).toString("hex");
}

async function createAdmin() {
  // Marina's credentials
  const email = "marinamrezende6@gmail.com";
  const password = "admin123"; // Change this!
  const name = "Marina Martins Rezende";

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM "user" WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      console.log("✅ Admin user already exists!");
      return;
    }

    // Create user
    const userId = generateId();
    await sql`
      INSERT INTO "user" (id, email, name, "emailVerified", role, "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${name}, true, 'admin', NOW(), NOW())
    `;

    // Create account with password
    const accountId = generateId();
    const hashedPassword = await hashPassword(password);
    await sql`
      INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
      VALUES (${accountId}, ${userId}, ${email}, 'credential', ${hashedPassword}, NOW(), NOW())
    `;

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
