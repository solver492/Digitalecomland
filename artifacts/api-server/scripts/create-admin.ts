/**
 * Script to create a default admin user
 * Usage: pnpm tsx scripts/create-admin.ts
 */

import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/lib/hash";
import "dotenv/config";

async function createAdmin() {
  const DEFAULT_ADMIN = {
    email: "admin@digitalecomland.com",
    password: "admin123456", // CHANGE THIS IN PRODUCTION
    fullName: "Admin User",
    role: "admin" as const,
  };

  console.log("🔐 Creating default admin user...");
  console.log(`📧 Email: ${DEFAULT_ADMIN.email}`);
  console.log(`🔑 Password: ${DEFAULT_ADMIN.password}`);
  console.log("⚠️  IMPORTANT: Change this password after first login!\n");

  try {
    // Check if admin already exists
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, DEFAULT_ADMIN.email))
      .limit(1);

    if (existing.length > 0) {
      console.log("✓ Admin user already exists");
      console.log(`  ID: ${existing[0].id}`);
      console.log(`  Email: ${existing[0].email}`);
      console.log(`  Role: ${existing[0].role}`);
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(DEFAULT_ADMIN.password);

    // Create admin user
    const [admin] = await db
      .insert(usersTable)
      .values({
        email: DEFAULT_ADMIN.email,
        passwordHash,
        fullName: DEFAULT_ADMIN.fullName,
        role: DEFAULT_ADMIN.role,
        isActive: true,
      })
      .returning();

    console.log("✓ Admin user created successfully!");
    console.log(`  ID: ${admin.id}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Created: ${admin.createdAt}`);
    console.log("\n✓ You can now login with these credentials");
  } catch (error) {
    console.error("✗ Error creating admin user:", error);
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
