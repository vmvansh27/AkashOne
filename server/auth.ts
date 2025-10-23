import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { storage } from "./storage";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;

// Temporary session storage for 2FA login flow
const twoFactorSessions = new Map<string, { userId: string; expiresAt: number }>();

export async function registerUser(
  username: string,
  email: string,
  password: string,
  gstNumber: string,
  accountType: string = "customer"
) {
  // Check if user already exists
  const existingUser = await storage.getUserByUsername(username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const existingEmail = await storage.getUserByEmail(email);
  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Validate GST number format
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gstNumber)) {
    throw new Error("Invalid GST number format");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate email verification code (6-digit OTP)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Create user
  const user = await storage.createUser({
    username,
    email,
    password: hashedPassword,
    gstNumber,
    accountType,
  });

  // Update user with verification code
  await storage.updateUser(user.id, {
    emailVerificationCode: verificationCode,
    emailVerificationExpiry: verificationExpiry,
    emailVerified: false,
  });

  // Assign Admin role ONLY to the FIRST user (bootstrap admin)
  // Subsequent users must be invited via team member system
  const allUsers = await storage.getUsers();
  const isFirstUser = allUsers.length === 1; // Only this user exists

  if (isFirstUser) {
    const roles = await storage.getRoles();
    const adminRole = roles.find((r) => r.name === "Admin" && r.isSystem);
    if (adminRole) {
      await storage.assignRoleToUser(user.id, adminRole.id, user.id);
    }
  }

  // TODO: Send verification email with OTP
  // In a real implementation, integrate with SendGrid/Resend to send email
  console.log(`[DEBUG] Email verification code for ${email}: ${verificationCode}`);

  return { user, verificationCode }; // Return verification code for development/testing
}

export async function verifyEmail(email: string, code: string) {
  const user = await storage.getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    throw new Error("Email already verified");
  }

  if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
    throw new Error("No verification code found");
  }

  if (new Date() > user.emailVerificationExpiry) {
    throw new Error("Verification code expired");
  }

  if (user.emailVerificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  // Mark email as verified
  await storage.updateUser(user.id, {
    emailVerified: true,
    emailVerificationCode: null,
    emailVerificationExpiry: null,
  });

  return { success: true };
}

export async function resendVerificationCode(email: string) {
  const user = await storage.getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    throw new Error("Email already verified");
  }

  // Generate new verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await storage.updateUser(user.id, {
    emailVerificationCode: verificationCode,
    emailVerificationExpiry: verificationExpiry,
  });

  // TODO: Send verification email
  console.log(`[DEBUG] New verification code for ${email}: ${verificationCode}`);

  return { success: true, verificationCode };
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

  // Check if email is verified (skip in development for easier testing)
  if (!user.emailVerified && process.env.NODE_ENV !== "development") {
    throw new Error("Please verify your email before logging in");
  }
  
  // In development, auto-verify users on first login for easier testing
  if (!user.emailVerified && process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] Auto-verifying ${user.email} in development mode`);
    await storage.updateUser(user.id, { emailVerified: true });
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
  const otpauthUrl = authenticator.keyuri(user.email, "AkashOne.com", secret);

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
