import { auth } from "../lib/auth";

async function createAdmin() {
  const email = "marinamrezende6@gmail.com";
  const password = "admin123";
  const name = "Marina Martins Rezende";

  try {
    // Use Better Auth API to create user
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (user) {
      console.log("✅ Admin user created successfully!");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);
      console.log("\n⚠️  IMPORTANT: Change the password after first login!");

      // Update role to admin
      console.log("\n🔧 Setting admin role...");
      // Note: You'll need to manually update the role in the database
      console.log("Run: UPDATE \"user\" SET role = 'admin' WHERE email = '" + email + "';");
    }
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("✅ User already exists!");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);
    } else {
      console.error("❌ Error creating admin user:", error);
      throw error;
    }
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
