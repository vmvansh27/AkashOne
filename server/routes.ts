import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
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
import { createFeatureFlagMiddleware } from "./middleware/feature-flags";
import { insertDiscountCouponSchema, insertVolumeSchema, insertVpcSchema } from "@shared/schema";

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

  // Feature flag middleware factory
  const requireFeature = createFeatureFlagMiddleware(storage);
  
  // Usage example for protecting routes with feature flags:
  // app.get("/api/payment-gateways", requireAuth, requireFeature("payment_gateway"), async (req, res) => {
  //   ... route handler
  // });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, gstNumber } = req.body;

      if (!username || !email || !password || !gstNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await registerUser(username, email, password, gstNumber);
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
        
        // Log successful login
        if (result.user) {
          await storage.createUserActivity({
            userId: result.user.id,
            username: result.user.username,
            action: "login",
            resourceType: null,
            resourceId: null,
            resourceName: null,
            ipAddress: req.ip || null,
            userAgent: req.headers["user-agent"] || null,
            metadata: { loginMethod: "password" },
          });
        }
        
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
      
      // Log successful 2FA login
      await storage.createUserActivity({
        userId: result.user.id,
        username: result.user.username,
        action: "login",
        resourceType: null,
        resourceId: null,
        resourceName: null,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        metadata: { loginMethod: "2fa" },
      });
      
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

  // DNS Domain endpoints
  app.get("/api/dns/domains", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const domains = await storage.getDnsDomains(req.session.userId);
      res.json(domains);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/dns/domains", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { name, dnssec, nameservers } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Domain name is required" });
      }

      const domain = await storage.createDnsDomain({
        name,
        dnssec: dnssec === true,
        nameservers: nameservers || undefined,
        status: "pending",
        userId: req.session.userId,
      });

      res.json(domain);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/dns/domains/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      
      // Verify ownership before allowing update
      const existingDomain = await storage.getDnsDomain(id);
      if (!existingDomain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      if (existingDomain.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Sanitize updates - only allow specific fields, never userId
      const { status, dnssec, nameservers } = req.body;
      const sanitizedUpdates: any = {};
      if (status !== undefined) sanitizedUpdates.status = status;
      if (dnssec !== undefined) sanitizedUpdates.dnssec = dnssec;
      if (nameservers !== undefined) sanitizedUpdates.nameservers = nameservers;

      const domain = await storage.updateDnsDomain(id, sanitizedUpdates);

      res.json(domain);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/dns/domains/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      
      // Verify ownership before allowing delete
      const existingDomain = await storage.getDnsDomain(id);
      if (!existingDomain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      if (existingDomain.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteDnsDomain(id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // DNS Record endpoints
  app.get("/api/dns/records/:domainId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { domainId } = req.params;
      
      // Verify domain ownership before returning records
      const domain = await storage.getDnsDomain(domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      if (domain.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const records = await storage.getDnsRecords(domainId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/dns/records", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { domainId, type, name, value, ttl, priority } = req.body;

      if (!domainId || !type || !name || !value) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify domain ownership before creating record
      const domain = await storage.getDnsDomain(domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      if (domain.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const record = await storage.createDnsRecord({
        domainId,
        type,
        name,
        value,
        ttl: ttl ? parseInt(ttl) : undefined,
        priority: priority ? parseInt(priority) : undefined,
        userId: req.session.userId,
      });

      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/dns/records/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      
      // Verify record ownership before allowing update
      const existingRecord = await storage.getDnsRecord(id);
      if (!existingRecord) {
        return res.status(404).json({ message: "Record not found" });
      }
      if (existingRecord.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Sanitize updates - only allow specific fields, never userId or domainId
      const { type, name, value, ttl, priority } = req.body;
      const sanitizedUpdates: any = {};
      if (type !== undefined) sanitizedUpdates.type = type;
      if (name !== undefined) sanitizedUpdates.name = name;
      if (value !== undefined) sanitizedUpdates.value = value;
      if (ttl !== undefined) sanitizedUpdates.ttl = ttl;
      if (priority !== undefined) sanitizedUpdates.priority = priority;

      const record = await storage.updateDnsRecord(id, sanitizedUpdates);

      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/dns/records/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      
      // Verify record ownership before allowing delete
      const existingRecord = await storage.getDnsRecord(id);
      if (!existingRecord) {
        return res.status(404).json({ message: "Record not found" });
      }
      if (existingRecord.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteDnsRecord(id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Virtual Machines endpoints
  // Get CloudStack zones (for provisioning wizard)
  app.get("/api/cloudstack/zones", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const result = await cloudstack.listZones();
      res.json(result.zone || []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get CloudStack templates (for provisioning wizard)
  app.get("/api/cloudstack/templates", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { zoneId } = req.query;
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const result = await cloudstack.listTemplates("featured", zoneId as string);
      res.json(result.template || []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get CloudStack service offerings (for provisioning wizard)
  app.get("/api/cloudstack/service-offerings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const result = await cloudstack.listServiceOfferings();
      res.json(result.serviceoffering || []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List virtual machines
  app.get("/api/vms", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const vms = await storage.getVirtualMachines(req.session.userId);
      res.json(vms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Deploy a new virtual machine
  app.post("/api/vms", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { name, displayName, templateId, serviceOfferingId, zoneId, networkIds } = req.body;

      if (!name || !templateId || !serviceOfferingId || !zoneId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Call CloudStack API to deploy VM (polls async job until complete)
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      
      const jobResult = await cloudstack.deployVirtualMachine({
        name,
        displayName: displayName || name,
        templateId,
        serviceOfferingId,
        zoneId,
        networkIds: networkIds || [],
      });

      // After async job completes, extract VM data from job result
      const vmData = jobResult.virtualmachine;
      
      if (!vmData) {
        throw new Error("VM deployment completed but no VM data returned");
      }

      // Cache VM in our database
      const vm = await storage.createVirtualMachine({
        cloudstackId: vmData.id,
        name: vmData.name,
        displayName: vmData.displayname || vmData.name,
        state: vmData.state,
        templateId: vmData.templateid,
        templateName: vmData.templatename || null,
        serviceOfferingId: vmData.serviceofferingid,
        serviceOfferingName: vmData.serviceofferingname || null,
        zoneId: vmData.zoneid,
        zoneName: vmData.zonename || null,
        cpu: vmData.cpunumber || 1,
        memory: vmData.memory || 512,
        ipAddress: vmData.nic?.[0]?.ipaddress || null,
        networkIds: vmData.nic?.map((n: any) => n.networkid) || null,
        userId: req.session.userId,
      });

      // Log VM creation activity
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await storage.createUserActivity({
          userId: user.id,
          username: user.username,
          action: "vm.create",
          resourceType: "vm",
          resourceId: vm.id,
          resourceName: vm.displayName,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          metadata: {
            cpu: vm.cpu,
            memory: vm.memory,
            templateName: vm.templateName,
            zoneName: vm.zoneName,
          },
        });
      }

      res.json(vm);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Start a virtual machine
  app.post("/api/vms/:id/start", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;

      // Verify ownership
      const vm = await storage.getVirtualMachine(id);
      if (!vm) {
        return res.status(404).json({ message: "VM not found" });
      }
      if (vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Call CloudStack API (polls async job until complete)
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const jobResult = await cloudstack.startVirtualMachine(vm.cloudstackId);

      // Update state from job result and return updated VM
      const vmData = jobResult.virtualmachine;
      let updatedVM = vm;
      if (vmData) {
        updatedVM = await storage.updateVirtualMachine(id, { 
          state: vmData.state,
          ipAddress: vmData.nic?.[0]?.ipaddress || vm.ipAddress,
        }) || vm;
      }

      // Log VM start activity
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await storage.createUserActivity({
          userId: user.id,
          username: user.username,
          action: "vm.start",
          resourceType: "vm",
          resourceId: updatedVM.id,
          resourceName: updatedVM.displayName,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          metadata: { state: updatedVM.state },
        });
      }

      res.json(updatedVM);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stop a virtual machine
  app.post("/api/vms/:id/stop", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;

      // Verify ownership
      const vm = await storage.getVirtualMachine(id);
      if (!vm) {
        return res.status(404).json({ message: "VM not found" });
      }
      if (vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Call CloudStack API (polls async job until complete)
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const jobResult = await cloudstack.stopVirtualMachine(vm.cloudstackId);

      // Update state from job result and return updated VM
      const vmData = jobResult.virtualmachine;
      let updatedVM = vm;
      if (vmData) {
        updatedVM = await storage.updateVirtualMachine(id, { state: vmData.state }) || vm;
      }

      // Log VM stop activity
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await storage.createUserActivity({
          userId: user.id,
          username: user.username,
          action: "vm.stop",
          resourceType: "vm",
          resourceId: updatedVM.id,
          resourceName: updatedVM.displayName,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          metadata: { state: updatedVM.state },
        });
      }

      res.json(updatedVM);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reboot a virtual machine
  app.post("/api/vms/:id/reboot", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;

      // Verify ownership
      const vm = await storage.getVirtualMachine(id);
      if (!vm) {
        return res.status(404).json({ message: "VM not found" });
      }
      if (vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Call CloudStack API (polls async job until complete)
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const jobResult = await cloudstack.rebootVirtualMachine(vm.cloudstackId);

      // Update state from job result and return updated VM
      const vmData = jobResult.virtualmachine;
      let updatedVM = vm;
      if (vmData) {
        updatedVM = await storage.updateVirtualMachine(id, { state: vmData.state }) || vm;
      }

      // Log VM reboot activity
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await storage.createUserActivity({
          userId: user.id,
          username: user.username,
          action: "vm.reboot",
          resourceType: "vm",
          resourceId: updatedVM.id,
          resourceName: updatedVM.displayName,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          metadata: { state: updatedVM.state },
        });
      }

      res.json(updatedVM);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Destroy a virtual machine
  app.delete("/api/vms/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;

      // Verify ownership
      const vm = await storage.getVirtualMachine(id);
      if (!vm) {
        return res.status(404).json({ message: "VM not found" });
      }
      if (vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Log VM delete activity before deletion
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await storage.createUserActivity({
          userId: user.id,
          username: user.username,
          action: "vm.delete",
          resourceType: "vm",
          resourceId: vm.id,
          resourceName: vm.displayName,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          metadata: {
            cloudstackId: vm.cloudstackId,
            zoneName: vm.zoneName,
          },
        });
      }

      // Call CloudStack API (polls async job until complete)
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      await cloudstack.destroyVirtualMachine(vm.cloudstackId, true);

      // Remove from cache after successful destruction
      await storage.deleteVirtualMachine(id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============================================
  // VM SNAPSHOTS
  // ============================================

  // List VM snapshots
  app.get("/api/vms/:vmId/snapshots", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const vmId = req.params.vmId;

      // Verify VM ownership
      const vm = await storage.getVirtualMachine(vmId);
      if (!vm || vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "VM not found or access denied" });
      }

      // Get snapshots from storage
      const snapshots = await storage.getVMSnapshots(vmId, req.session.userId);
      res.json(snapshots);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create VM snapshot
  app.post("/api/vms/:vmId/snapshots", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const vmId = req.params.vmId;
      const { name, description, snapshotMemory } = req.body;

      // Verify VM ownership
      const vm = await storage.getVirtualMachine(vmId);
      if (!vm || vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "VM not found or access denied" });
      }

      // Call CloudStack API
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const cloudstackSnapshot = await cloudstack.createVMSnapshot(
        vm.cloudstackId,
        name,
        description,
        snapshotMemory ?? true
      );

      // Store snapshot in database
      const snapshot = await storage.createVMSnapshot({
        cloudstackSnapshotId: cloudstackSnapshot.id,
        vmId: vm.id,
        userId: req.session.userId,
        name: cloudstackSnapshot.name || name,
        description: cloudstackSnapshot.description || description || null,
        state: cloudstackSnapshot.state,
        snapshotMemory: snapshotMemory ?? true,
      });

      res.json(snapshot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete VM snapshot
  app.delete("/api/snapshots/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const snapshotId = req.params.id;

      // Get snapshot from storage
      const snapshot = await storage.getVMSnapshot(snapshotId);
      if (!snapshot) {
        return res.status(404).json({ message: "Snapshot not found" });
      }

      // Verify ownership via VM
      const vm = await storage.getVirtualMachine(snapshot.vmId);
      if (!vm || vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Call CloudStack API
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      await cloudstack.deleteVMSnapshot(snapshot.cloudstackSnapshotId);

      // Delete from storage
      await storage.deleteVMSnapshot(snapshotId);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Restore VM to snapshot
  app.post("/api/snapshots/:id/restore", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const snapshotId = req.params.id;

      // Get snapshot from storage
      const snapshot = await storage.getVMSnapshot(snapshotId);
      if (!snapshot) {
        return res.status(404).json({ message: "Snapshot not found" });
      }

      // Verify ownership via VM
      const vm = await storage.getVirtualMachine(snapshot.vmId);
      if (!vm || vm.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Call CloudStack API
      const { getCloudStackClient } = await import("./cloudstack/client");
      const cloudstack = getCloudStackClient();
      const restoredVM = await cloudstack.revertToVMSnapshot(snapshot.cloudstackSnapshotId);

      // Update VM state in storage
      if (restoredVM) {
        await storage.updateVirtualMachine(vm.id, {
          state: restoredVM.state,
          lastSynced: new Date(),
        });
      }

      res.json({ success: true, vm: restoredVM });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===================================
  // Feature Flags Management
  // ===================================

  // Get all feature flags
  app.get("/api/feature-flags", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const flags = await storage.getFeatureFlags();
      res.json(flags);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get feature flag by key
  app.get("/api/feature-flags/key/:key", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const flag = await storage.getFeatureFlagByKey(req.params.key);
      if (!flag) {
        return res.status(404).json({ message: "Feature flag not found" });
      }

      res.json(flag);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update feature flag (toggle enabled/disabled)
  app.patch("/api/feature-flags/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // TODO: Add super admin role check here
      // For now, any authenticated user can toggle features (update this when RBAC is implemented)

      const { enabled } = req.body;
      if (typeof enabled !== "boolean") {
        return res.status(400).json({ message: "Invalid request: enabled must be boolean" });
      }

      const updatedFlag = await storage.updateFeatureFlag(req.params.id, { enabled });
      if (!updatedFlag) {
        return res.status(404).json({ message: "Feature flag not found" });
      }

      res.json(updatedFlag);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================================
  // Service Plans (Machine Configurations)
  // ===================================

  // Get all service plans
  app.get("/api/service-plans", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      const plans = await storage.getServicePlans(user?.organizationId ?? undefined);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single service plan
  app.get("/api/service-plans/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const plan = await storage.getServicePlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Service plan not found" });
      }

      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create service plan
  app.post("/api/service-plans", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check admin/reseller permission
      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions to manage service plans" });
      }

      // Validate request with Zod
      const { insertServicePlanSchema } = await import("@shared/schema");
      const validatedData = insertServicePlanSchema.parse(req.body);

      const user = await storage.getUser(req.session.userId);
      const plan = await storage.createServicePlan({
        ...validatedData,
        organizationId: user?.organizationId || null,
      });

      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update service plan
  app.patch("/api/service-plans/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check admin/reseller permission
      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions to manage service plans" });
      }

      const updated = await storage.updateServicePlan(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Service plan not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete service plan
  app.delete("/api/service-plans/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check admin/reseller permission
      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions to manage service plans" });
      }

      const deleted = await storage.deleteServicePlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Service plan not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===================================
  // Activity Logging
  // ===================================

  // Create activity log
  app.post("/api/activity-logs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { action, resourceType, resourceId, metadata } = req.body;
      
      if (!action || !resourceType) {
        return res.status(400).json({ message: "Missing required fields: action and resourceType" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const activity = await storage.createUserActivity({
        userId: req.session.userId,
        username: user.username,
        action,
        resourceType: resourceType || null,
        resourceId: resourceId || null,
        resourceName: null,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        metadata: metadata || null,
      });

      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get activity logs (with optional user filtering)
  app.get("/api/activity-logs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { userId } = req.query;
      
      // If userId is provided, filter by that user
      // Otherwise, return all activities (for admin view)
      let activities;
      
      if (userId && typeof userId === "string") {
        activities = await storage.getUserActivities(userId);
      } else {
        // Call getUserActivities without parameters to get all activities
        activities = await storage.getUserActivities();
      }

      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================================
  // IAM - Roles Management
  // ===================================

  // Get all roles (filtered by organization if user is not admin)
  app.get("/api/iam/roles", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get roles - system roles plus org-specific roles
      const roles = await storage.getRoles(user.organizationId ?? undefined);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create custom role
  app.post("/api/iam/roles", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check permission
      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Role name is required" });
      }

      const role = await storage.createRole({
        name,
        description,
        isSystem: false,
        organizationId: user.organizationId,
      });

      res.status(201).json(role);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update role
  app.patch("/api/iam/roles/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (role.isSystem) {
        return res.status(400).json({ message: "Cannot modify system roles" });
      }

      const { name, description } = req.body;
      const updatedRole = await storage.updateRole(req.params.id, { name, description });
      res.json(updatedRole);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete role
  app.delete("/api/iam/roles/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (role.isSystem) {
        return res.status(400).json({ message: "Cannot delete system roles" });
      }

      await storage.deleteRole(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================================
  // IAM - Permissions Management
  // ===================================

  // Get all permissions
  app.get("/api/iam/permissions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get permissions for a specific role
  app.get("/api/iam/roles/:roleId/permissions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const permissions = await storage.getRolePermissions(req.params.roleId);
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assign permission to role
  app.post("/api/iam/roles/:roleId/permissions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const role = await storage.getRole(req.params.roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (role.isSystem) {
        return res.status(400).json({ message: "Cannot modify system role permissions" });
      }

      const { permissionId } = req.body;
      if (!permissionId) {
        return res.status(400).json({ message: "Permission ID is required" });
      }

      const rolePermission = await storage.assignPermissionToRole(req.params.roleId, permissionId);
      res.status(201).json(rolePermission);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Remove permission from role
  app.delete("/api/iam/roles/:roleId/permissions/:permissionId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "iam.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const role = await storage.getRole(req.params.roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (role.isSystem) {
        return res.status(400).json({ message: "Cannot modify system role permissions" });
      }

      await storage.removePermissionFromRole(req.params.roleId, req.params.permissionId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================================
  // IAM - Team Members Management
  // ===================================

  // Get all team members in organization
  app.get("/api/iam/team-members", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.view");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const teamMembers = await storage.getTeamMembers(user.organizationId);
      
      // Enrich with user roles
      const enrichedMembers = await Promise.all(
        teamMembers.map(async (member) => {
          if (member.userId) {
            const roles = await storage.getUserRoles(member.userId);
            return { ...member, roles };
          }
          return { ...member, roles: [] };
        })
      );

      res.json(enrichedMembers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Invite team member
  app.post("/api/iam/team-members", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { email, roleIds } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if member already exists
      const existing = await storage.getTeamMemberByEmail(email, user.organizationId);
      if (existing) {
        return res.status(400).json({ message: "Team member already exists" });
      }

      // Generate invitation token
      const invitationToken = randomUUID();

      const teamMember = await storage.createTeamMember({
        email,
        organizationId: user.organizationId,
        invitedBy: req.session.userId,
        invitationToken,
        status: "invited",
      });

      // TODO: Send invitation email with token

      res.status(201).json(teamMember);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update team member (change status, assign roles, etc.)
  app.patch("/api/iam/team-members/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }

      const { status } = req.body;
      const updatedMember = await storage.updateTeamMember(req.params.id, { status });
      res.json(updatedMember);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Remove team member
  app.delete("/api/iam/team-members/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }

      await storage.deleteTeamMember(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================================
  // IAM - User Role Assignments
  // ===================================

  // Get roles for a user
  app.get("/api/iam/users/:userId/roles", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.view");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const roles = await storage.getUserRoles(req.params.userId);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assign role to user
  app.post("/api/iam/users/:userId/roles", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { roleId } = req.body;
      if (!roleId) {
        return res.status(400).json({ message: "Role ID is required" });
      }

      const userRole = await storage.assignRoleToUser(
        req.params.userId,
        roleId,
        req.session.userId
      );
      res.status(201).json(userRole);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Remove role from user
  app.delete("/api/iam/users/:userId/roles/:roleId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const hasPermission = await storage.userHasPermission(req.session.userId, "team.manage");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      await storage.removeRoleFromUser(req.params.userId, req.params.roleId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user's permissions
  app.get("/api/iam/me/permissions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const roles = await storage.getUserRoles(req.session.userId);
      const allPermissions: Set<string> = new Set();

      for (const role of roles) {
        const permissions = await storage.getRolePermissions(role.id);
        permissions.forEach((p) => allPermissions.add(p.key));
      }

      res.json(Array.from(allPermissions));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Discount Coupons Management
  app.get("/api/coupons", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const coupons = await storage.getDiscountCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/coupons/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const coupon = await storage.getDiscountCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/coupons/validate", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { code, orderAmount } = req.body;
      const result = await storage.validateCoupon(code, orderAmount);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertDiscountCouponSchema.parse(req.body);
      const coupon = await storage.createDiscountCoupon({
        ...validatedData,
        createdBy: req.session.userId,
      });
      res.status(201).json(coupon);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid coupon data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/coupons/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const coupon = await storage.updateDiscountCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const deleted = await storage.deleteDiscountCoupon(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json({ message: "Coupon deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user discount percentage (Super Admin only)
  app.patch("/api/users/:id/discount", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== "super_admin") {
        return res.status(403).json({ message: "Only super admins can set discount percentages" });
      }

      const { discountPercentage } = req.body;
      
      if (typeof discountPercentage !== "number" || discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ message: "Discount percentage must be between 0 and 100" });
      }

      const user = await storage.updateUser(req.params.id, {
        defaultDiscountPercentage: discountPercentage,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Discount percentage updated successfully", user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Block Storage (Volumes) endpoints
  app.get("/api/volumes", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const volumes = await storage.getVolumes(req.session.userId);
      res.json(volumes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/volumes/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const volume = await storage.getVolume(req.params.id);
      if (!volume) {
        return res.status(404).json({ message: "Volume not found" });
      }
      if (volume.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(volume);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/volumes", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertVolumeSchema.omit({ userId: true, cloudstackId: true }).parse(req.body);
      // In production, cloudstackId would come from CloudStack API response
      // For now, generate a unique ID (this will be replaced when CloudStack integration is active)
      const cloudstackId = `vol-${randomUUID().split('-')[0]}`;
      const volume = await storage.createVolume({
        ...validatedData,
        cloudstackId,
        userId: req.session.userId,
      });
      res.status(201).json(volume);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/volumes/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const volume = await storage.getVolume(req.params.id);
      if (!volume) {
        return res.status(404).json({ message: "Volume not found" });
      }
      if (volume.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Exclude protected/immutable fields from updates
      const validatedData = insertVolumeSchema.partial().omit({
        userId: true,
        cloudstackId: true,
      }).parse(req.body);
      
      const updated = await storage.updateVolume(req.params.id, validatedData);
      res.json(updated);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/volumes/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const volume = await storage.getVolume(req.params.id);
      if (!volume) {
        return res.status(404).json({ message: "Volume not found" });
      }
      if (volume.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteVolume(req.params.id);
      res.json({ message: "Volume deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Attach volume to VM
  app.post("/api/volumes/:id/attach", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const volume = await storage.getVolume(req.params.id);
      if (!volume) {
        return res.status(404).json({ message: "Volume not found" });
      }
      if (volume.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { vmId, vmName } = req.body;
      if (!vmId) {
        return res.status(400).json({ message: "VM ID is required" });
      }

      const updated = await storage.attachVolume(req.params.id, vmId, vmName);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Detach volume from VM
  app.post("/api/volumes/:id/detach", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const volume = await storage.getVolume(req.params.id);
      if (!volume) {
        return res.status(404).json({ message: "Volume not found" });
      }
      if (volume.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updated = await storage.detachVolume(req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================================
  // VPC (Virtual Private Cloud) endpoints
  // ===================================

  app.get("/api/vpcs", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const vpcs = await storage.getVpcs(req.session.userId);
      res.json(vpcs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/vpcs/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const vpc = await storage.getVpc(req.params.id);
      if (!vpc) {
        return res.status(404).json({ message: "VPC not found" });
      }
      if (vpc.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(vpc);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vpcs", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertVpcSchema.omit({ userId: true, cloudstackId: true }).parse(req.body);
      // In production, cloudstackId would come from CloudStack API response
      // For now, generate a unique ID (this will be replaced when CloudStack integration is active)
      const cloudstackId = `vpc-${randomUUID().split('-')[0]}`;
      const vpc = await storage.createVpc({
        ...validatedData,
        cloudstackId,
        userId: req.session.userId,
      });
      res.status(201).json(vpc);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/vpcs/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const vpc = await storage.getVpc(req.params.id);
      if (!vpc) {
        return res.status(404).json({ message: "VPC not found" });
      }
      if (vpc.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Exclude protected/immutable fields from updates
      const validatedData = insertVpcSchema.partial().omit({
        userId: true,
        cloudstackId: true,
      }).parse(req.body);
      
      const updated = await storage.updateVpc(req.params.id, validatedData);
      res.json(updated);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/vpcs/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const vpc = await storage.getVpc(req.params.id);
      if (!vpc) {
        return res.status(404).json({ message: "VPC not found" });
      }
      if (vpc.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteVpc(req.params.id);
      res.json({ message: "VPC deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
