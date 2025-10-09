import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import {
  registerUser,
  loginUser,
  verifyTwoFactor,
  generateTwoFactorSecret,
  enableTwoFactor,
  disableTwoFactor,
} from "./auth";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "development-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await registerUser(username, email, password);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Missing credentials" });
      }

      const result = await loginUser(username, password);

      if (result.requiresTwoFactor) {
        res.json(result);
      } else {
        req.session.userId = result.user?.id;
        res.json(result);
      }
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Verify 2FA endpoint
  app.post("/api/auth/verify-2fa", async (req, res) => {
    try {
      const { sessionToken, twoFactorCode } = req.body;

      if (!sessionToken || !twoFactorCode) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await verifyTwoFactor(sessionToken, twoFactorCode);
      req.session.userId = result.user.id;
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password or secret
      const { password, twoFactorSecret, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Setup 2FA endpoint
  app.get("/api/auth/2fa/setup", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = await generateTwoFactorSecret(req.session.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enable 2FA endpoint
  app.post("/api/auth/2fa/enable", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Verification code required" });
      }

      const result = await enableTwoFactor(req.session.userId, code);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Disable 2FA endpoint
  app.post("/api/auth/2fa/disable", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = await disableTwoFactor(req.session.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Kubernetes Cluster endpoints
  app.get("/api/kubernetes/clusters", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const clusters = await storage.getKubernetesClusters(req.session.userId);
      res.json(clusters);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/kubernetes/clusters", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { name, version, region, masterNodes, workerNodes, instanceType, autoHealing, autoScaling } = req.body;

      if (!name || !version || !region || !instanceType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const cluster = await storage.createKubernetesCluster({
        name,
        version,
        region,
        masterNodes: parseInt(masterNodes) || 3,
        workerNodes: parseInt(workerNodes) || 3,
        instanceType,
        autoHealing: autoHealing !== false,
        autoScaling: autoScaling === true,
        status: "running",
        cpuTotal: 0,
        memoryTotal: 0,
        userId: req.session.userId,
      });

      res.json(cluster);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/kubernetes/clusters/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const updates = req.body;

      const cluster = await storage.updateKubernetesCluster(id, updates);

      if (!cluster) {
        return res.status(404).json({ message: "Cluster not found" });
      }

      res.json(cluster);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/kubernetes/clusters/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteKubernetesCluster(id);

      if (!deleted) {
        return res.status(404).json({ message: "Cluster not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Database endpoints
  app.get("/api/databases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const databases = await storage.getDatabases(req.session.userId);
      res.json(databases);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/databases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { name, engine, version, region, storage, cpu, memory, instanceType, backupEnabled, multiAZ } = req.body;

      if (!name || !engine || !version || !region || !instanceType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const database = await storage.createDatabase({
        name,
        engine,
        version,
        region,
        storage: parseInt(storage) || 100,
        cpu: parseInt(cpu) || 2,
        memory: parseInt(memory) || 8,
        instanceType,
        backupEnabled: backupEnabled !== false,
        multiAZ: multiAZ === true,
        status: "running",
        port: 5432,
        connectionsMax: 200,
        userId: req.session.userId,
      });

      res.json(database);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/databases/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const updates = req.body;

      const database = await storage.updateDatabase(id, updates);

      if (!database) {
        return res.status(404).json({ message: "Database not found" });
      }

      res.json(database);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/databases/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteDatabase(id);

      if (!deleted) {
        return res.status(404).json({ message: "Database not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
