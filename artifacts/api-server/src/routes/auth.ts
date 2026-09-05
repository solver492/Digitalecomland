import { Router } from "express";
import { db, usersTable, type PublicUser } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/hash";
import { generateToken } from "../lib/jwt";
import { requireAuth } from "../middlewares/auth";
import { z } from "zod";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "affiliate", "user"]).optional().default("user"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// ============================================================
// REGISTER
// ============================================================

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password, fullName, role } = parsed.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
        fullName,
        role,
        isActive: true,
      })
      .returning();

    // Remove password from response
    const { passwordHash: _, ...publicUser } = newUser;

    // Generate token
    const token = generateToken(publicUser as PublicUser);

    res.status(201).json({
      user: publicUser,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// LOGIN
// ============================================================

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    // Find user
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Remove password from response
    const { passwordHash: _, ...publicUser } = user;

    // Generate token
    const token = generateToken(publicUser as PublicUser);

    res.json({
      user: publicUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// GET CURRENT USER (Protected)
// ============================================================

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Fetch fresh user data
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Remove password from response
    const { passwordHash: _, ...publicUser } = user;

    res.json({ user: publicUser });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// LOGOUT (Optional - mainly client-side token removal)
// ============================================================

router.post("/auth/logout", requireAuth, (_req, res): void => {
  // JWT is stateless, so logout is handled client-side by removing the token
  // This endpoint exists for consistency and potential future enhancements
  res.json({ message: "Logged out successfully" });
});

export default router;
