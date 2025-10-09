import {
  type User,
  type InsertUser,
  type KubernetesCluster,
  type InsertKubernetesCluster,
  type Database,
  type InsertDatabase,
  type DnsDomain,
  type InsertDnsDomain,
  type DnsRecord,
  type InsertDnsRecord,
  type VirtualMachine,
  type InsertVirtualMachine,
  type VMSnapshot,
  type InsertVMSnapshot,
  type FeatureFlag,
  type InsertFeatureFlag,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Kubernetes
  getKubernetesClusters(userId: string): Promise<KubernetesCluster[]>;
  getKubernetesCluster(id: string): Promise<KubernetesCluster | undefined>;
  createKubernetesCluster(cluster: InsertKubernetesCluster & { userId: string }): Promise<KubernetesCluster>;
  updateKubernetesCluster(id: string, data: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined>;
  deleteKubernetesCluster(id: string): Promise<boolean>;

  // Databases
  getDatabases(userId: string): Promise<Database[]>;
  getDatabase(id: string): Promise<Database | undefined>;
  createDatabase(database: InsertDatabase & { userId: string }): Promise<Database>;
  updateDatabase(id: string, data: Partial<Database>): Promise<Database | undefined>;
  deleteDatabase(id: string): Promise<boolean>;

  // DNS Domains
  getDnsDomains(userId: string): Promise<DnsDomain[]>;
  getDnsDomain(id: string): Promise<DnsDomain | undefined>;
  createDnsDomain(domain: InsertDnsDomain & { userId: string }): Promise<DnsDomain>;
  updateDnsDomain(id: string, data: Partial<DnsDomain>): Promise<DnsDomain | undefined>;
  deleteDnsDomain(id: string): Promise<boolean>;

  // DNS Records
  getDnsRecords(domainId: string): Promise<DnsRecord[]>;
  getDnsRecord(id: string): Promise<DnsRecord | undefined>;
  createDnsRecord(record: InsertDnsRecord & { userId: string }): Promise<DnsRecord>;
  updateDnsRecord(id: string, data: Partial<DnsRecord>): Promise<DnsRecord | undefined>;
  deleteDnsRecord(id: string): Promise<boolean>;

  // Virtual Machines
  getVirtualMachines(userId: string): Promise<VirtualMachine[]>;
  getVirtualMachine(id: string): Promise<VirtualMachine | undefined>;
  getVirtualMachineByCloudstackId(cloudstackId: string): Promise<VirtualMachine | undefined>;
  createVirtualMachine(vm: InsertVirtualMachine & { userId: string }): Promise<VirtualMachine>;
  updateVirtualMachine(id: string, data: Partial<VirtualMachine>): Promise<VirtualMachine | undefined>;
  deleteVirtualMachine(id: string): Promise<boolean>;

  // VM Snapshots
  getVMSnapshots(vmId: string, userId: string): Promise<VMSnapshot[]>;
  getVMSnapshot(id: string): Promise<VMSnapshot | undefined>;
  getVMSnapshotByCloudstackId(cloudstackSnapshotId: string): Promise<VMSnapshot | undefined>;
  createVMSnapshot(snapshot: InsertVMSnapshot): Promise<VMSnapshot>;
  deleteVMSnapshot(id: string): Promise<boolean>;

  // Feature Flags
  getFeatureFlags(): Promise<FeatureFlag[]>;
  getFeatureFlag(id: string): Promise<FeatureFlag | undefined>;
  getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined>;
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  updateFeatureFlag(id: string, data: Partial<FeatureFlag>): Promise<FeatureFlag | undefined>;
  deleteFeatureFlag(id: string): Promise<boolean>;
  initializeDefaultFeatureFlags(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private kubernetesClusters: Map<string, KubernetesCluster>;
  private databases: Map<string, Database>;
  private dnsDomains: Map<string, DnsDomain>;
  private dnsRecords: Map<string, DnsRecord>;
  private virtualMachines: Map<string, VirtualMachine>;
  private vmSnapshots: Map<string, VMSnapshot>;
  private featureFlags: Map<string, FeatureFlag>;

  constructor() {
    this.users = new Map();
    this.kubernetesClusters = new Map();
    this.databases = new Map();
    this.dnsDomains = new Map();
    this.dnsRecords = new Map();
    this.virtualMachines = new Map();
    this.vmSnapshots = new Map();
    this.featureFlags = new Map();
    
    // Initialize default feature flags
    this.initializeDefaultFeatureFlags();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      twoFactorSecret: null,
      twoFactorEnabled: null,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Kubernetes methods
  async getKubernetesClusters(userId: string): Promise<KubernetesCluster[]> {
    return Array.from(this.kubernetesClusters.values()).filter(
      (cluster) => cluster.userId === userId,
    );
  }

  async getKubernetesCluster(id: string): Promise<KubernetesCluster | undefined> {
    return this.kubernetesClusters.get(id);
  }

  async createKubernetesCluster(cluster: InsertKubernetesCluster & { userId: string }): Promise<KubernetesCluster> {
    const id = `k8s-${randomUUID().slice(0, 8)}`;
    const cpuTotal = cluster.masterNodes * 4 + cluster.workerNodes * 4;
    const memoryTotal = cluster.masterNodes * 16 + cluster.workerNodes * 16;

    const newCluster: KubernetesCluster = {
      id,
      name: cluster.name,
      version: cluster.version,
      status: cluster.status || "running",
      masterNodes: cluster.masterNodes,
      workerNodes: cluster.workerNodes,
      region: cluster.region,
      instanceType: cluster.instanceType,
      autoHealing: cluster.autoHealing ?? true,
      autoScaling: cluster.autoScaling ?? false,
      cpuUsed: 0,
      cpuTotal,
      memoryUsed: 0,
      memoryTotal,
      podsRunning: 0,
      podsTotal: 250,
      health: "healthy",
      createdAt: new Date(),
      userId: cluster.userId,
    };
    this.kubernetesClusters.set(id, newCluster);
    return newCluster;
  }

  async updateKubernetesCluster(id: string, data: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined> {
    const cluster = this.kubernetesClusters.get(id);
    if (!cluster) return undefined;
    const updatedCluster = { ...cluster, ...data };
    this.kubernetesClusters.set(id, updatedCluster);
    return updatedCluster;
  }

  async deleteKubernetesCluster(id: string): Promise<boolean> {
    return this.kubernetesClusters.delete(id);
  }

  // Database methods
  async getDatabases(userId: string): Promise<Database[]> {
    return Array.from(this.databases.values()).filter(
      (database) => database.userId === userId,
    );
  }

  async getDatabase(id: string): Promise<Database | undefined> {
    return this.databases.get(id);
  }

  async createDatabase(database: InsertDatabase & { userId: string }): Promise<Database> {
    const id = `db-${database.engine}-${randomUUID().slice(0, 8)}`;
    const portMap = {
      mysql: 3306,
      postgresql: 5432,
      mongodb: 27017,
      redis: 6379,
    };

    const connectionsMaxMap = {
      mysql: 200,
      postgresql: 500,
      mongodb: 100,
      redis: 1000,
    };

    const newDatabase: Database = {
      id,
      name: database.name,
      engine: database.engine,
      version: database.version,
      status: database.status || "running",
      storage: database.storage,
      cpu: database.cpu,
      memory: database.memory,
      region: database.region,
      instanceType: database.instanceType,
      endpoint: `${database.name}.akashone.com`,
      port: portMap[database.engine as keyof typeof portMap] || 5432,
      backupEnabled: database.backupEnabled ?? true,
      multiAZ: database.multiAZ ?? false,
      connectionsCurrent: 0,
      connectionsMax: connectionsMaxMap[database.engine as keyof typeof connectionsMaxMap] || 200,
      createdAt: new Date(),
      userId: database.userId,
    };
    this.databases.set(id, newDatabase);
    return newDatabase;
  }

  async updateDatabase(id: string, data: Partial<Database>): Promise<Database | undefined> {
    const database = this.databases.get(id);
    if (!database) return undefined;
    const updatedDatabase = { ...database, ...data };
    this.databases.set(id, updatedDatabase);
    return updatedDatabase;
  }

  async deleteDatabase(id: string): Promise<boolean> {
    return this.databases.delete(id);
  }

  // DNS Domain methods
  async getDnsDomains(userId: string): Promise<DnsDomain[]> {
    return Array.from(this.dnsDomains.values()).filter(
      (domain) => domain.userId === userId,
    );
  }

  async getDnsDomain(id: string): Promise<DnsDomain | undefined> {
    return this.dnsDomains.get(id);
  }

  async createDnsDomain(domain: InsertDnsDomain & { userId: string }): Promise<DnsDomain> {
    const id = `dns-${randomUUID().slice(0, 8)}`;
    const newDomain: DnsDomain = {
      id,
      name: domain.name,
      status: domain.status || "pending",
      recordCount: 0,
      dnssec: domain.dnssec ?? false,
      nameservers: domain.nameservers || ["ns1.akashone.com", "ns2.akashone.com"],
      lastModified: new Date(),
      createdAt: new Date(),
      userId: domain.userId,
    };
    this.dnsDomains.set(id, newDomain);
    return newDomain;
  }

  async updateDnsDomain(id: string, data: Partial<DnsDomain>): Promise<DnsDomain | undefined> {
    const domain = this.dnsDomains.get(id);
    if (!domain) return undefined;
    const updatedDomain = { ...domain, ...data, lastModified: new Date() };
    this.dnsDomains.set(id, updatedDomain);
    return updatedDomain;
  }

  async deleteDnsDomain(id: string): Promise<boolean> {
    // Delete all records for this domain
    const records = Array.from(this.dnsRecords.values()).filter(
      (record) => record.domainId === id,
    );
    records.forEach((record) => this.dnsRecords.delete(record.id));
    return this.dnsDomains.delete(id);
  }

  // DNS Record methods
  async getDnsRecords(domainId: string): Promise<DnsRecord[]> {
    return Array.from(this.dnsRecords.values()).filter(
      (record) => record.domainId === domainId,
    );
  }

  async getDnsRecord(id: string): Promise<DnsRecord | undefined> {
    return this.dnsRecords.get(id);
  }

  async createDnsRecord(record: InsertDnsRecord & { userId: string }): Promise<DnsRecord> {
    const id = `rec-${randomUUID().slice(0, 8)}`;
    const newRecord: DnsRecord = {
      id,
      domainId: record.domainId,
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl ?? 3600,
      priority: record.priority ?? null,
      createdAt: new Date(),
      userId: record.userId,
    };
    this.dnsRecords.set(id, newRecord);
    
    // Update domain record count
    const domain = this.dnsDomains.get(record.domainId);
    if (domain) {
      domain.recordCount += 1;
      domain.lastModified = new Date();
      this.dnsDomains.set(domain.id, domain);
    }
    
    return newRecord;
  }

  async updateDnsRecord(id: string, data: Partial<DnsRecord>): Promise<DnsRecord | undefined> {
    const record = this.dnsRecords.get(id);
    if (!record) return undefined;
    const updatedRecord = { ...record, ...data };
    this.dnsRecords.set(id, updatedRecord);
    
    // Update domain lastModified
    const domain = this.dnsDomains.get(record.domainId);
    if (domain) {
      domain.lastModified = new Date();
      this.dnsDomains.set(domain.id, domain);
    }
    
    return updatedRecord;
  }

  async deleteDnsRecord(id: string): Promise<boolean> {
    const record = this.dnsRecords.get(id);
    if (!record) return false;
    
    // Update domain record count
    const domain = this.dnsDomains.get(record.domainId);
    if (domain) {
      domain.recordCount = Math.max(0, domain.recordCount - 1);
      domain.lastModified = new Date();
      this.dnsDomains.set(domain.id, domain);
    }
    
    return this.dnsRecords.delete(id);
  }

  // Virtual Machine methods
  async getVirtualMachines(userId: string): Promise<VirtualMachine[]> {
    return Array.from(this.virtualMachines.values()).filter(
      (vm) => vm.userId === userId,
    );
  }

  async getVirtualMachine(id: string): Promise<VirtualMachine | undefined> {
    return this.virtualMachines.get(id);
  }

  async getVirtualMachineByCloudstackId(cloudstackId: string): Promise<VirtualMachine | undefined> {
    return Array.from(this.virtualMachines.values()).find(
      (vm) => vm.cloudstackId === cloudstackId,
    );
  }

  async createVirtualMachine(vm: InsertVirtualMachine & { userId: string }): Promise<VirtualMachine> {
    const id = `vm-${randomUUID().slice(0, 8)}`;
    const newVM: VirtualMachine = {
      id,
      cloudstackId: vm.cloudstackId,
      name: vm.name,
      displayName: vm.displayName || vm.name,
      state: vm.state || "Creating",
      templateId: vm.templateId,
      templateName: vm.templateName || null,
      serviceOfferingId: vm.serviceOfferingId,
      serviceOfferingName: vm.serviceOfferingName || null,
      zoneId: vm.zoneId,
      zoneName: vm.zoneName || null,
      cpu: vm.cpu,
      memory: vm.memory,
      diskSize: vm.diskSize || null,
      ipAddress: vm.ipAddress || null,
      publicIp: vm.publicIp || null,
      networkIds: vm.networkIds || null,
      tags: vm.tags || null,
      createdAt: new Date(),
      lastSynced: new Date(),
      userId: vm.userId,
    };
    this.virtualMachines.set(id, newVM);
    return newVM;
  }

  async updateVirtualMachine(id: string, data: Partial<VirtualMachine>): Promise<VirtualMachine | undefined> {
    const vm = this.virtualMachines.get(id);
    if (!vm) return undefined;
    const updatedVM = { ...vm, ...data, lastSynced: new Date() };
    this.virtualMachines.set(id, updatedVM);
    return updatedVM;
  }

  async deleteVirtualMachine(id: string): Promise<boolean> {
    return this.virtualMachines.delete(id);
  }

  // VM Snapshots
  async getVMSnapshots(vmId: string, userId: string): Promise<VMSnapshot[]> {
    return Array.from(this.vmSnapshots.values()).filter(
      (snapshot) => snapshot.vmId === vmId && snapshot.userId === userId
    );
  }

  async getVMSnapshot(id: string): Promise<VMSnapshot | undefined> {
    return this.vmSnapshots.get(id);
  }

  async getVMSnapshotByCloudstackId(cloudstackSnapshotId: string): Promise<VMSnapshot | undefined> {
    return Array.from(this.vmSnapshots.values()).find(
      (snapshot) => snapshot.cloudstackSnapshotId === cloudstackSnapshotId
    );
  }

  async createVMSnapshot(snapshot: InsertVMSnapshot): Promise<VMSnapshot> {
    const id = randomUUID();
    const newSnapshot: VMSnapshot = {
      id,
      cloudstackSnapshotId: snapshot.cloudstackSnapshotId,
      vmId: snapshot.vmId,
      userId: snapshot.userId,
      name: snapshot.name,
      description: snapshot.description ?? null,
      state: snapshot.state,
      snapshotMemory: snapshot.snapshotMemory ?? null,
      createdAt: new Date(),
    };
    this.vmSnapshots.set(id, newSnapshot);
    return newSnapshot;
  }

  async deleteVMSnapshot(id: string): Promise<boolean> {
    return this.vmSnapshots.delete(id);
  }

  // Feature Flags
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.featureFlags.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag | undefined> {
    return this.featureFlags.get(id);
  }

  async getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined> {
    return Array.from(this.featureFlags.values()).find((flag) => flag.key === key);
  }

  async createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag> {
    const id = randomUUID();
    const newFlag: FeatureFlag = {
      id,
      key: flag.key,
      name: flag.name,
      description: flag.description ?? null,
      category: flag.category,
      enabled: flag.enabled ?? false,
      icon: flag.icon ?? null,
      sortOrder: flag.sortOrder ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.featureFlags.set(id, newFlag);
    return newFlag;
  }

  async updateFeatureFlag(id: string, data: Partial<FeatureFlag>): Promise<FeatureFlag | undefined> {
    const flag = this.featureFlags.get(id);
    if (!flag) return undefined;
    const updatedFlag = { ...flag, ...data, updatedAt: new Date() };
    this.featureFlags.set(id, updatedFlag);
    return updatedFlag;
  }

  async deleteFeatureFlag(id: string): Promise<boolean> {
    return this.featureFlags.delete(id);
  }

  async initializeDefaultFeatureFlags(): Promise<void> {
    const defaultFlags: InsertFeatureFlag[] = [
      // Core Services (Already enabled)
      {
        key: "virtual_machines",
        name: "Virtual Machines",
        description: "VM provisioning and management with CloudStack integration",
        category: "Compute",
        enabled: true,
        icon: "Server",
        sortOrder: 1,
      },
      {
        key: "kubernetes",
        name: "Kubernetes Service",
        description: "Managed Kubernetes clusters with auto-scaling",
        category: "Compute",
        enabled: true,
        icon: "Container",
        sortOrder: 2,
      },
      {
        key: "database",
        name: "Database-as-a-Service",
        description: "Managed database instances (MySQL, PostgreSQL, MongoDB, Redis)",
        category: "Compute",
        enabled: true,
        icon: "Database",
        sortOrder: 3,
      },
      {
        key: "dns",
        name: "DNS Management",
        description: "Domain and DNS record management",
        category: "Networking",
        enabled: true,
        icon: "Globe",
        sortOrder: 4,
      },
      {
        key: "object_storage",
        name: "Object Storage",
        description: "S3-compatible object storage service",
        category: "Storage",
        enabled: true,
        icon: "HardDrive",
        sortOrder: 5,
      },
      {
        key: "billing",
        name: "Billing & Invoices",
        description: "Indian GST-compliant billing system",
        category: "Billing",
        enabled: true,
        icon: "Receipt",
        sortOrder: 6,
      },

      // New Features (Initially disabled)
      {
        key: "payment_gateway",
        name: "Payment Gateway Configuration",
        description: "Configure Stripe, Razorpay, PayPal payment integrations",
        category: "Billing",
        enabled: false,
        icon: "CreditCard",
        sortOrder: 10,
      },
      {
        key: "pricing_calculator",
        name: "Pricing Calculator",
        description: "Interactive cost estimation tool for resources",
        category: "Billing",
        enabled: false,
        icon: "Calculator",
        sortOrder: 11,
      },
      {
        key: "load_balancer",
        name: "Load Balancer Service",
        description: "Request distribution and high-availability load balancing",
        category: "Networking",
        enabled: false,
        icon: "Network",
        sortOrder: 12,
      },
      {
        key: "gpu_instances",
        name: "GPU Instances",
        description: "NVIDIA GPU compute instances for AI/ML workloads",
        category: "Compute",
        enabled: false,
        icon: "Zap",
        sortOrder: 13,
      },
      {
        key: "ssl_certificates",
        name: "SSL Certificate Manager",
        description: "Automated SSL certificate provisioning and management",
        category: "Networking",
        enabled: false,
        icon: "Shield",
        sortOrder: 14,
      },
      {
        key: "cdn_service",
        name: "CDN Service",
        description: "Content delivery network for global acceleration",
        category: "Networking",
        enabled: false,
        icon: "Cloudy",
        sortOrder: 15,
      },
      {
        key: "auto_scaling",
        name: "VM Auto-Scaling Groups",
        description: "Dynamic resource scaling based on load metrics",
        category: "Compute",
        enabled: false,
        icon: "TrendingUp",
        sortOrder: 16,
      },
    ];

    for (const flag of defaultFlags) {
      const existing = await this.getFeatureFlagByKey(flag.key);
      if (!existing) {
        await this.createFeatureFlag(flag);
      }
    }
  }
}

export const storage = new MemStorage();
