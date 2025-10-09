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
  type Role,
  type InsertRole,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type UserRole,
  type InsertUserRole,
  type TeamMember,
  type InsertTeamMember,
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

  // IAM - Roles
  getRoles(organizationId?: string): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  // IAM - Permissions
  getPermissions(): Promise<Permission[]>;
  getPermission(id: string): Promise<Permission | undefined>;
  getPermissionByKey(key: string): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;

  // IAM - Role Permissions
  getRolePermissions(roleId: string): Promise<Permission[]>;
  assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean>;

  // IAM - User Roles
  getUserRoles(userId: string): Promise<Role[]>;
  assignRoleToUser(userId: string, roleId: string, grantedBy: string): Promise<UserRole>;
  removeRoleFromUser(userId: string, roleId: string): Promise<boolean>;

  // IAM - Team Members
  getTeamMembers(organizationId: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  getTeamMemberByEmail(email: string, organizationId: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // IAM - Permission Checks
  userHasPermission(userId: string, permissionKey: string): Promise<boolean>;
  initializeDefaultPermissions(): Promise<void>;
  initializeDefaultRoles(): Promise<void>;
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
  private roles: Map<string, Role>;
  private permissions: Map<string, Permission>;
  private rolePermissions: Map<string, RolePermission>;
  private userRoles: Map<string, UserRole>;
  private teamMembers: Map<string, TeamMember>;

  constructor() {
    this.users = new Map();
    this.kubernetesClusters = new Map();
    this.databases = new Map();
    this.dnsDomains = new Map();
    this.dnsRecords = new Map();
    this.virtualMachines = new Map();
    this.vmSnapshots = new Map();
    this.featureFlags = new Map();
    this.roles = new Map();
    this.permissions = new Map();
    this.rolePermissions = new Map();
    this.userRoles = new Map();
    this.teamMembers = new Map();
    
    // Initialize defaults
    this.initializeDefaultFeatureFlags();
    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
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

  // IAM - Roles
  async getRoles(organizationId?: string): Promise<Role[]> {
    if (organizationId) {
      return Array.from(this.roles.values()).filter(
        (role) => role.organizationId === organizationId || role.isSystem
      );
    }
    return Array.from(this.roles.values());
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = randomUUID();
    const role: Role = {
      id,
      name: insertRole.name,
      description: insertRole.description ?? null,
      isSystem: insertRole.isSystem ?? false,
      organizationId: insertRole.organizationId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;
    const updatedRole = { ...role, ...data, updatedAt: new Date() };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roles.delete(id);
  }

  // IAM - Permissions
  async getPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    return this.permissions.get(id);
  }

  async getPermissionByKey(key: string): Promise<Permission | undefined> {
    return Array.from(this.permissions.values()).find((p) => p.key === key);
  }

  async createPermission(insertPermission: InsertPermission): Promise<Permission> {
    const id = randomUUID();
    const permission: Permission = {
      id,
      key: insertPermission.key,
      name: insertPermission.name,
      description: insertPermission.description ?? null,
      category: insertPermission.category,
      createdAt: new Date(),
    };
    this.permissions.set(id, permission);
    return permission;
  }

  // IAM - Role Permissions
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePerms = Array.from(this.rolePermissions.values()).filter(
      (rp) => rp.roleId === roleId
    );
    const permissionIds = rolePerms.map((rp) => rp.permissionId);
    return Array.from(this.permissions.values()).filter((p) =>
      permissionIds.includes(p.id)
    );
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    const id = randomUUID();
    const rolePermission: RolePermission = {
      id,
      roleId,
      permissionId,
      createdAt: new Date(),
    };
    this.rolePermissions.set(id, rolePermission);
    return rolePermission;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const rolePerms = Array.from(this.rolePermissions.entries()).filter(
      ([_, rp]) => rp.roleId === roleId && rp.permissionId === permissionId
    );
    if (rolePerms.length === 0) return false;
    for (const [id] of rolePerms) {
      this.rolePermissions.delete(id);
    }
    return true;
  }

  // IAM - User Roles
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoleEntries = Array.from(this.userRoles.values()).filter(
      (ur) => ur.userId === userId
    );
    const roleIds = userRoleEntries.map((ur) => ur.roleId);
    return Array.from(this.roles.values()).filter((r) => roleIds.includes(r.id));
  }

  async assignRoleToUser(userId: string, roleId: string, grantedBy: string): Promise<UserRole> {
    const id = randomUUID();
    const userRole: UserRole = {
      id,
      userId,
      roleId,
      grantedBy,
      createdAt: new Date(),
    };
    this.userRoles.set(id, userRole);
    return userRole;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const userRoleEntries = Array.from(this.userRoles.entries()).filter(
      ([_, ur]) => ur.userId === userId && ur.roleId === roleId
    );
    if (userRoleEntries.length === 0) return false;
    for (const [id] of userRoleEntries) {
      this.userRoles.delete(id);
    }
    return true;
  }

  // IAM - Team Members
  async getTeamMembers(organizationId: string): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(
      (tm) => tm.organizationId === organizationId
    );
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async getTeamMemberByEmail(email: string, organizationId: string): Promise<TeamMember | undefined> {
    return Array.from(this.teamMembers.values()).find(
      (tm) => tm.email === email && tm.organizationId === organizationId
    );
  }

  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const teamMember: TeamMember = {
      id,
      email: insertTeamMember.email,
      userId: insertTeamMember.userId ?? null,
      organizationId: insertTeamMember.organizationId,
      status: insertTeamMember.status ?? "invited",
      invitedBy: insertTeamMember.invitedBy,
      invitationToken: insertTeamMember.invitationToken ?? null,
      invitedAt: new Date(),
      joinedAt: null,
    };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const member = this.teamMembers.get(id);
    if (!member) return undefined;
    const updatedMember = { ...member, ...data };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // IAM - Permission Checks
  async userHasPermission(userId: string, permissionKey: string): Promise<boolean> {
    // Get all roles for the user
    const userRolesList = await this.getUserRoles(userId);
    const roleIds = userRolesList.map((r) => r.id);

    // Get all role permissions for these roles
    const allRolePerms = Array.from(this.rolePermissions.values()).filter((rp) =>
      roleIds.includes(rp.roleId)
    );
    const permissionIds = allRolePerms.map((rp) => rp.permissionId);

    // Check if any of these permissions match the key
    const permissions = Array.from(this.permissions.values()).filter((p) =>
      permissionIds.includes(p.id)
    );
    return permissions.some((p) => p.key === permissionKey);
  }

  async initializeDefaultPermissions(): Promise<void> {
    const defaultPermissions: InsertPermission[] = [
      // Compute permissions
      { key: "vm.view", name: "View Virtual Machines", category: "Compute" },
      { key: "vm.create", name: "Create Virtual Machines", category: "Compute" },
      { key: "vm.update", name: "Update Virtual Machines", category: "Compute" },
      { key: "vm.delete", name: "Delete Virtual Machines", category: "Compute" },
      { key: "kubernetes.view", name: "View Kubernetes Clusters", category: "Compute" },
      { key: "kubernetes.create", name: "Create Kubernetes Clusters", category: "Compute" },
      { key: "kubernetes.delete", name: "Delete Kubernetes Clusters", category: "Compute" },
      { key: "database.view", name: "View Databases", category: "Compute" },
      { key: "database.create", name: "Create Databases", category: "Compute" },
      { key: "database.delete", name: "Delete Databases", category: "Compute" },

      // Networking permissions
      { key: "network.view", name: "View Networks", category: "Networking" },
      { key: "network.create", name: "Create Networks", category: "Networking" },
      { key: "dns.view", name: "View DNS", category: "Networking" },
      { key: "dns.manage", name: "Manage DNS", category: "Networking" },

      // Storage permissions
      { key: "storage.view", name: "View Storage", category: "Storage" },
      { key: "storage.manage", name: "Manage Storage", category: "Storage" },

      // Billing permissions
      { key: "billing.view", name: "View Billing", category: "Billing" },
      { key: "billing.manage", name: "Manage Billing", category: "Billing" },

      // IAM permissions
      { key: "iam.view", name: "View IAM", category: "IAM" },
      { key: "iam.manage", name: "Manage IAM", category: "IAM" },
      { key: "team.view", name: "View Team Members", category: "IAM" },
      { key: "team.manage", name: "Manage Team Members", category: "IAM" },
    ];

    for (const perm of defaultPermissions) {
      const existing = await this.getPermissionByKey(perm.key);
      if (!existing) {
        await this.createPermission(perm);
      }
    }
  }

  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles: Array<{ role: InsertRole; permissionKeys: string[] }> = [
      {
        role: {
          name: "Admin",
          description: "Full access to all resources",
          isSystem: true,
        },
        permissionKeys: [
          "vm.view", "vm.create", "vm.update", "vm.delete",
          "kubernetes.view", "kubernetes.create", "kubernetes.delete",
          "database.view", "database.create", "database.delete",
          "network.view", "network.create",
          "dns.view", "dns.manage",
          "storage.view", "storage.manage",
          "billing.view", "billing.manage",
          "iam.view", "iam.manage",
          "team.view", "team.manage",
        ],
      },
      {
        role: {
          name: "Editor",
          description: "Can create and manage resources but not billing or IAM",
          isSystem: true,
        },
        permissionKeys: [
          "vm.view", "vm.create", "vm.update", "vm.delete",
          "kubernetes.view", "kubernetes.create", "kubernetes.delete",
          "database.view", "database.create", "database.delete",
          "network.view", "network.create",
          "dns.view", "dns.manage",
          "storage.view", "storage.manage",
          "billing.view",
          "team.view",
        ],
      },
      {
        role: {
          name: "Viewer",
          description: "Read-only access to all resources",
          isSystem: true,
        },
        permissionKeys: [
          "vm.view",
          "kubernetes.view",
          "database.view",
          "network.view",
          "dns.view",
          "storage.view",
          "billing.view",
          "team.view",
        ],
      },
    ];

    for (const { role: roleData, permissionKeys } of defaultRoles) {
      // Check if role already exists
      const existingRole = Array.from(this.roles.values()).find(
        (r) => r.name === roleData.name && r.isSystem
      );
      
      let role: Role;
      if (!existingRole) {
        role = await this.createRole(roleData);
      } else {
        role = existingRole;
      }

      // Assign permissions to role
      for (const permKey of permissionKeys) {
        const permission = await this.getPermissionByKey(permKey);
        if (permission) {
          // Check if permission is already assigned
          const rolePerms = await this.getRolePermissions(role.id);
          const alreadyAssigned = rolePerms.some((p) => p.key === permKey);
          if (!alreadyAssigned) {
            await this.assignPermissionToRole(role.id, permission.id);
          }
        }
      }
    }
  }
}

export const storage = new MemStorage();
