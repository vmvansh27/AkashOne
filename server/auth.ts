import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { storage } from "./storage";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;

// Temporary session storage for 2FA login flow
const twoFactorSessions = new Map<string, { userId: string; expiresAt: number }>();

export async function registerUser(username: string, email: string, password: string) {
  // Check if user already exists
  const existingUser = await storage.getUserByUsername(username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const existingEmail = await storage.getUserByEmail(email);
  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await storage.createUser({
    username,
    email,
    password: hashedPassword,
  });

  return user;
}

export async function loginUser(username: string, password: string) {
  const user = await storage.getUserByUsername(username);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Update last login
  await storage.updateUser(user.id, { lastLogin: new Date() });

  // Check if 2FA is enabled
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    // Generate temporary session token
    const sessionToken = randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    twoFactorSessions.set(sessionToken, { userId: user.id, expiresAt });

    return {
      requiresTwoFactor: true,
      sessionToken,
    };
  }

  return {
    requiresTwoFactor: false,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

export async function verifyTwoFactor(sessionToken: string, code: string) {
  const session = twoFactorSessions.get(sessionToken);

  if (!session) {
    throw new Error("Invalid or expired session");
  }

  if (Date.now() > session.expiresAt) {
    twoFactorSessions.delete(sessionToken);
    throw new Error("Session expired");
  }

  const user = await storage.getUser(session.userId);

  if (!user || !user.twoFactorSecret) {
    throw new Error("Invalid session");
  }

  const isValid = authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new Error("Invalid verification code");
  }

  // Clean up session
  twoFactorSessions.delete(sessionToken);

  return {
    user: { id: user.id, username: user.username, email: user.email },
  };
}

export async function generateTwoFactorSecret(userId: string) {
  const user = await storage.getUser(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(user.email, "CloudStack Portal", secret);

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  // Store the secret (but don't enable 2FA yet)
  await storage.updateUser(userId, { twoFactorSecret: secret });

  return {
    secret,
    qrCodeUrl,
  };
}

export async function enableTwoFactor(userId: string, code: string) {
  const user = await storage.getUser(userId);

  if (!user || !user.twoFactorSecret) {
    throw new Error("2FA secret not found. Please setup 2FA first.");
  }

  const isValid = authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new Error("Invalid verification code");
  }

  await storage.updateUser(userId, { twoFactorEnabled: true });

  return { success: true };
}

export async function disableTwoFactor(userId: string) {
  await storage.updateUser(userId, {
    twoFactorEnabled: false,
    twoFactorSecret: null,
  });

  return { success: true };
}
