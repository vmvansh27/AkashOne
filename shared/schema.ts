import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, jsonb, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  gstNumber: text("gst_number").notNull(), // Mandatory GST number for Indian business compliance
  emailVerified: boolean("email_verified").default(false),
  emailVerificationCode: text("email_verification_code"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  accountType: text("account_type").notNull().default("customer"), // super_admin, reseller, customer, team_member
  organizationId: varchar("organization_id"), // References the parent organization/reseller
  defaultDiscountPercentage: integer("default_discount_percentage").default(0), // Permanent discount % assigned by super admin (0-100)
  status: text("status").notNull().default("active"), // active, suspended, invited
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const kubernetesClusters = pgTable("kubernetes_clusters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("creating"),
  masterNodes: integer("master_nodes").notNull(),
  workerNodes: integer("worker_nodes").notNull(),
  region: text("region").notNull(),
  instanceType: text("instance_type").notNull(),
  autoHealing: boolean("auto_healing").notNull().default(true),
  autoScaling: boolean("auto_scaling").notNull().default(false),
  cpuUsed: integer("cpu_used").notNull().default(0),
  cpuTotal: integer("cpu_total").notNull(),
  memoryUsed: integer("memory_used").notNull().default(0),
  memoryTotal: integer("memory_total").notNull(),
  podsRunning: integer("pods_running").notNull().default(0),
  podsTotal: integer("pods_total").notNull().default(250),
  health: text("health").notNull().default("healthy"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const databases = pgTable("databases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  engine: text("engine").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("creating"),
  storage: integer("storage").notNull(),
  cpu: integer("cpu").notNull(),
  memory: integer("memory").notNull(),
  region: text("region").notNull(),
  instanceType: text("instance_type").notNull(),
  endpoint: text("endpoint").notNull(),
  port: integer("port").notNull(),
  backupEnabled: boolean("backup_enabled").notNull().default(true),
  multiAZ: boolean("multi_az").notNull().default(false),
  connectionsCurrent: integer("connections_current").notNull().default(0),
  connectionsMax: integer("connections_max").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const dnsDomains = pgTable("dns_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"),
  recordCount: integer("record_count").notNull().default(0),
  dnssec: boolean("dnssec").notNull().default(false),
  nameservers: text("nameservers").array().notNull().default(sql`ARRAY['ns1.akashone.com', 'ns2.akashone.com']::text[]`),
  lastModified: timestamp("last_modified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const dnsRecords = pgTable("dns_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull().references(() => dnsDomains.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  ttl: integer("ttl").notNull().default(3600),
  priority: integer("priority"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const virtualMachines = pgTable("virtual_machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  state: text("state").notNull().default("Creating"),
  templateId: varchar("template_id").notNull(),
  templateName: text("template_name"),
  serviceOfferingId: varchar("service_offering_id").notNull(),
  serviceOfferingName: text("service_offering_name"),
  zoneId: varchar("zone_id").notNull(),
  zoneName: text("zone_name"),
  cpu: integer("cpu").notNull(),
  memory: integer("memory").notNull(),
  diskSize: integer("disk_size"),
  ipAddress: text("ip_address"),
  publicIp: text("public_ip"),
  networkIds: text("network_ids").array(),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  lastSynced: timestamp("last_synced").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const discountCoupons = pgTable("discount_coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: integer("discount_value").notNull(), // percentage (1-100) or amount in INR
  durationType: text("duration_type").notNull(), // "once", "forever", "repeating"
  durationMonths: integer("duration_months"), // for "repeating" type
  maxUses: integer("max_uses"), // null = unlimited
  timesUsed: integer("times_used").notNull().default(0),
  minOrderAmount: integer("min_order_amount"), // minimum order amount in INR (paise)
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  gstNumber: true,
  accountType: true,
}).extend({
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format"),
});

export const insertKubernetesClusterSchema = createInsertSchema(kubernetesClusters).omit({
  id: true,
  createdAt: true,
  cpuUsed: true,
  memoryUsed: true,
  podsRunning: true,
  podsTotal: true,
  health: true,
  userId: true,
});

export const insertDatabaseSchema = createInsertSchema(databases).omit({
  id: true,
  createdAt: true,
  endpoint: true,
  connectionsCurrent: true,
  userId: true,
});

export const insertDnsDomainSchema = createInsertSchema(dnsDomains).omit({
  id: true,
  createdAt: true,
  lastModified: true,
  recordCount: true,
  userId: true,
});

export const insertDnsRecordSchema = createInsertSchema(dnsRecords).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertVirtualMachineSchema = createInsertSchema(virtualMachines).omit({
  id: true,
  createdAt: true,
  lastSynced: true,
  userId: true,
});

export const insertDiscountCouponSchema = createInsertSchema(discountCoupons).omit({
  id: true,
  createdAt: true,
  timesUsed: true,
  createdBy: true,
}).extend({
  code: z.string().min(3).max(50).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().positive(),
  durationType: z.enum(["once", "forever", "repeating"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type KubernetesCluster = typeof kubernetesClusters.$inferSelect;
export type InsertKubernetesCluster = z.infer<typeof insertKubernetesClusterSchema>;
export type Database = typeof databases.$inferSelect;
export type InsertDatabase = z.infer<typeof insertDatabaseSchema>;
export type DnsDomain = typeof dnsDomains.$inferSelect;
export type InsertDnsDomain = z.infer<typeof insertDnsDomainSchema>;
export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;
export type VirtualMachine = typeof virtualMachines.$inferSelect;
export type InsertVirtualMachine = z.infer<typeof insertVirtualMachineSchema>;
export type DiscountCoupon = typeof discountCoupons.$inferSelect;
export type InsertDiscountCoupon = z.infer<typeof insertDiscountCouponSchema>;

export const vmSnapshots = pgTable("vm_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackSnapshotId: varchar("cloudstack_snapshot_id", { length: 255 }).notNull().unique(),
  vmId: varchar("vm_id").references(() => virtualMachines.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  state: varchar("state", { length: 50 }).notNull(),
  snapshotMemory: boolean("snapshot_memory").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVMSnapshotSchema = createInsertSchema(vmSnapshots).omit({
  id: true,
  createdAt: true,
});

export type VMSnapshot = typeof vmSnapshots.$inferSelect;
export type InsertVMSnapshot = z.infer<typeof insertVMSnapshotSchema>;

export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  enabled: boolean("enabled").notNull().default(false),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

// IAM - Roles
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false), // System roles cannot be deleted
  organizationId: varchar("organization_id").references(() => users.id), // null for system roles, organizationId for custom roles
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// IAM - Permissions
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "vm.create", "billing.view"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // e.g., "Compute", "Networking", "Billing"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IAM - Role Permissions (Many-to-Many)
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: varchar("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IAM - User Roles (Many-to-Many)
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  grantedBy: varchar("granted_by").references(() => users.id), // Who assigned this role
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IAM - Team Members (Invitation tracking)
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // null until invitation accepted
  organizationId: varchar("organization_id").notNull().references(() => users.id), // The organization they're invited to
  status: text("status").notNull().default("invited"), // invited, active, suspended
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  invitationToken: varchar("invitation_token", { length: 255 }),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  joinedAt: timestamp("joined_at"),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  invitedAt: true,
  joinedAt: true,
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

// Service Plans - Custom machine configurations (hybrid with CloudStack)
export const servicePlans = pgTable("service_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Standard Medium", "Performance Large"
  description: text("description"), // e.g., "Perfect for web applications"
  cpu: integer("cpu").notNull(), // Number of vCPUs
  memory: integer("memory").notNull(), // Memory in MB
  storage: integer("storage").notNull(), // Disk size in GB
  bandwidth: integer("bandwidth"), // Network bandwidth in Mbps (optional)
  cloudstackOfferingId: varchar("cloudstack_offering_id"), // Maps to CloudStack service offering
  price: integer("price").notNull().default(0), // Monthly price in INR
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true), // Public or organization-specific
  organizationId: varchar("organization_id"), // null = global, otherwise org-specific
  sortOrder: integer("sort_order").notNull().default(0), // Display order
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServicePlanSchema = createInsertSchema(servicePlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ServicePlan = typeof servicePlans.$inferSelect;
export type InsertServicePlan = z.infer<typeof insertServicePlanSchema>;

// Activity Logging
export const userActivities = pgTable("user_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull(), // Denormalized for reporting
  action: text("action").notNull(), // "login", "vm.create", "vm.delete", "vm.start", "vm.stop", etc.
  resourceType: text("resource_type"), // "vm", "kubernetes", "database", etc.
  resourceId: varchar("resource_id"), // ID of the resource
  resourceName: text("resource_name"), // Name of the resource for display
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Additional context (e.g., VM specs, region, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  createdAt: true,
});

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

// Block Storage Volumes
export const volumes = pgTable("volumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  state: text("state").notNull().default("Creating"), // Creating, Ready, Allocated, Attached, Detaching, etc.
  type: text("type").notNull().default("DATADISK"), // DATADISK, ROOT
  size: integer("size").notNull(), // GB
  diskOfferingId: varchar("disk_offering_id"),
  diskOfferingName: text("disk_offering_name"),
  attachedVmId: varchar("attached_vm_id"), // null if not attached
  attachedVmName: text("attached_vm_name"),
  zoneId: varchar("zone_id").notNull(),
  zoneName: text("zone_name"),
  deviceId: integer("device_id"), // Device ID when attached
  path: text("path"), // Mount path if attached
  storageType: text("storage_type"), // local, shared, networked
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  lastSynced: timestamp("last_synced").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertVolumeSchema = createInsertSchema(volumes).omit({
  id: true,
  createdAt: true,
  lastSynced: true,
});

export type Volume = typeof volumes.$inferSelect;
export type InsertVolume = z.infer<typeof insertVolumeSchema>;

// Virtual Private Cloud (VPC)
export const vpcs = pgTable("vpcs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  cidr: text("cidr").notNull(), // e.g., 10.0.0.0/16
  state: text("state").notNull().default("Enabled"),
  vpcOfferingId: varchar("vpc_offering_id").notNull(),
  vpcOfferingName: text("vpc_offering_name"),
  zoneId: varchar("zone_id").notNull(),
  zoneName: text("zone_name"),
  networkDomain: text("network_domain"), // DNS domain
  redundantRouter: boolean("redundant_router").default(false),
  region: text("region"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  lastSynced: timestamp("last_synced").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertVpcSchema = createInsertSchema(vpcs).omit({
  id: true,
  createdAt: true,
  lastSynced: true,
});

export type Vpc = typeof vpcs.$inferSelect;
export type InsertVpc = z.infer<typeof insertVpcSchema>;

// Firewall Rules
export const firewallRules = pgTable("firewall_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  protocol: text("protocol").notNull(), // tcp, udp, icmp, all
  startPort: integer("start_port"),
  endPort: integer("end_port"),
  cidrList: text("cidr_list").array().default(sql`ARRAY[]::text[]`), // e.g., ['0.0.0.0/0']
  ipAddressId: varchar("ip_address_id"),
  ipAddress: text("ip_address"),
  state: text("state").notNull().default("Active"),
  purpose: text("purpose"), // Firewall, PortForwarding, StaticNat, LoadBalancing
  networkId: varchar("network_id"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertFirewallRuleSchema = createInsertSchema(firewallRules).omit({
  id: true,
  createdAt: true,
});

export type FirewallRule = typeof firewallRules.$inferSelect;
export type InsertFirewallRule = z.infer<typeof insertFirewallRuleSchema>;

// NAT Gateways
export const natGateways = pgTable("nat_gateways", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id"),
  name: text("name").notNull(),
  type: text("type").notNull(), // StaticNAT, SourceNAT, PrivateGateway
  ipAddressId: varchar("ip_address_id").notNull(),
  ipAddress: text("ip_address").notNull(),
  vmId: varchar("vm_id"), // For StaticNAT
  vmName: text("vm_name"),
  vpcId: varchar("vpc_id"), // For VPC NAT
  networkId: varchar("network_id"),
  state: text("state").notNull().default("Active"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertNatGatewaySchema = createInsertSchema(natGateways).omit({
  id: true,
  createdAt: true,
});

export type NatGateway = typeof natGateways.$inferSelect;
export type InsertNatGateway = z.infer<typeof insertNatGatewaySchema>;

// SSH Keys
export const sshKeys = pgTable("ssh_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  fingerprint: text("fingerprint").notNull(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key"), // Optional, only if generated by system
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertSshKeySchema = createInsertSchema(sshKeys).omit({
  id: true,
  createdAt: true,
});

export type SshKey = typeof sshKeys.$inferSelect;
export type InsertSshKey = z.infer<typeof insertSshKeySchema>;

// ISO Images
export const isoImages = pgTable("iso_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  displayText: text("display_text"),
  osType: text("os_type"),
  osTypeId: varchar("os_type_id"),
  size: integer("size"), // bytes
  isPublic: boolean("is_public").default(false),
  bootable: boolean("bootable").default(true),
  isExtractable: boolean("is_extractable").default(false),
  isFeatured: boolean("is_featured").default(false),
  isReady: boolean("is_ready").default(false),
  url: text("url"), // Source URL
  zoneId: varchar("zone_id"),
  zoneName: text("zone_name"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertIsoImageSchema = createInsertSchema(isoImages).omit({
  id: true,
  createdAt: true,
});

export type IsoImage = typeof isoImages.$inferSelect;
export type InsertIsoImage = z.infer<typeof insertIsoImageSchema>;

// Reserved/Elastic IPs
export const reservedIps = pgTable("reserved_ips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  ipAddress: text("ip_address").notNull().unique(),
  state: text("state").notNull().default("Allocated"), // Allocated, Reserved, Free
  isSourceNat: boolean("is_source_nat").default(false),
  isStaticNat: boolean("is_static_nat").default(false),
  vpcId: varchar("vpc_id"),
  networkId: varchar("network_id"),
  associatedVmId: varchar("associated_vm_id"),
  associatedVmName: text("associated_vm_name"),
  zoneId: varchar("zone_id").notNull(),
  zoneName: text("zone_name"),
  purpose: text("purpose"), // StaticNat, Firewall, LoadBalancer
  tags: jsonb("tags"),
  allocatedAt: timestamp("allocated_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertReservedIpSchema = createInsertSchema(reservedIps).omit({
  id: true,
  allocatedAt: true,
});

export type ReservedIp = typeof reservedIps.$inferSelect;
export type InsertReservedIp = z.infer<typeof insertReservedIpSchema>;

// IPSEC VPN Tunnels
export const ipsecTunnels = pgTable("ipsec_tunnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  customerGatewayId: varchar("customer_gateway_id").notNull(),
  customerGatewayIp: text("customer_gateway_ip").notNull(),
  customerCidr: text("customer_cidr").notNull(), // Customer network CIDR
  vpcId: varchar("vpc_id").notNull(),
  publicIp: text("public_ip"),
  state: text("state").notNull().default("Disconnected"), // Connected, Disconnected, Pending
  ikePolicy: text("ike_policy"), // Encryption algorithm
  espPolicy: text("esp_policy"), // ESP policy
  ikeLifetime: integer("ike_lifetime").default(86400), // seconds
  espLifetime: integer("esp_lifetime").default(3600), // seconds
  dpd: boolean("dpd").default(true), // Dead Peer Detection
  forceEncap: boolean("force_encap").default(false),
  passive: boolean("passive").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertIpsecTunnelSchema = createInsertSchema(ipsecTunnels).omit({
  id: true,
  createdAt: true,
});

export type IpsecTunnel = typeof ipsecTunnels.$inferSelect;
export type InsertIpsecTunnel = z.infer<typeof insertIpsecTunnelSchema>;

// Load Balancers
export const loadBalancers = pgTable("load_balancers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  algorithm: text("algorithm").notNull().default("roundrobin"), // roundrobin, leastconn, source
  protocol: text("protocol").notNull(), // tcp, udp, http, https
  publicPort: integer("public_port").notNull(),
  privatePort: integer("private_port").notNull(),
  publicIpId: varchar("public_ip_id").notNull(),
  publicIp: text("public_ip").notNull(),
  networkId: varchar("network_id"),
  vpcId: varchar("vpc_id"),
  state: text("state").notNull().default("Active"), // Active, Inactive
  stickiness: boolean("stickiness").default(false),
  healthCheck: boolean("health_check").default(true),
  healthCheckPath: text("health_check_path").default("/"),
  healthCheckInterval: integer("health_check_interval").default(30),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertLoadBalancerSchema = createInsertSchema(loadBalancers).omit({
  id: true,
  createdAt: true,
});

export type LoadBalancer = typeof loadBalancers.$inferSelect;
export type InsertLoadBalancer = z.infer<typeof insertLoadBalancerSchema>;

// SSL Certificates
export const sslCertificates = pgTable("ssl_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  certificate: text("certificate").notNull(), // PEM format
  privateKey: text("private_key").notNull(), // PEM format
  chain: text("chain"), // Certificate chain
  issuer: text("issuer"),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status").notNull().default("Active"), // Active, Expired, Revoked
  autoRenew: boolean("auto_renew").default(false),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertSslCertificateSchema = createInsertSchema(sslCertificates).omit({
  id: true,
  createdAt: true,
});

export type SslCertificate = typeof sslCertificates.$inferSelect;
export type InsertSslCertificate = z.infer<typeof insertSslCertificateSchema>;

// Object Storage (S3-compatible)
export const objectStorageBuckets = pgTable("object_storage_buckets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull().unique(),
  region: text("region").notNull(),
  accessKey: text("access_key").notNull(),
  secretKey: text("secret_key").notNull(),
  endpoint: text("endpoint").notNull(),
  versioning: boolean("versioning").default(false),
  publicAccess: boolean("public_access").default(false),
  encryption: boolean("encryption").default(true),
  size: bigint("size", { mode: "number" }).default(0), // bytes
  objectCount: integer("object_count").default(0),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertObjectStorageBucketSchema = createInsertSchema(objectStorageBuckets).omit({
  id: true,
  createdAt: true,
});

export type ObjectStorageBucket = typeof objectStorageBuckets.$inferSelect;
export type InsertObjectStorageBucket = z.infer<typeof insertObjectStorageBucketSchema>;

// DDoS Protection
export const ddosProtectionRules = pgTable("ddos_protection_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  ipAddressId: varchar("ip_address_id").notNull(),
  ipAddress: text("ip_address").notNull(),
  protectionLevel: text("protection_level").notNull().default("standard"), // standard, advanced, premium
  enabled: boolean("enabled").default(true),
  trafficThreshold: integer("traffic_threshold").default(1000), // Mbps
  packetThreshold: integer("packet_threshold").default(100000), // packets per second
  autoMitigation: boolean("auto_mitigation").default(true),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertDdosProtectionRuleSchema = createInsertSchema(ddosProtectionRules).omit({
  id: true,
  createdAt: true,
});

export type DdosProtectionRule = typeof ddosProtectionRules.$inferSelect;
export type InsertDdosProtectionRule = z.infer<typeof insertDdosProtectionRuleSchema>;

// CDN Distributions
export const cdnDistributions = pgTable("cdn_distributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  originServer: text("origin_server").notNull(),
  originProtocol: text("origin_protocol").notNull().default("https"), // http, https
  status: text("status").notNull().default("Enabled"), // Enabled, Disabled, Deploying
  cacheEnabled: boolean("cache_enabled").default(true),
  cacheTtl: integer("cache_ttl").default(3600), // seconds
  compressionEnabled: boolean("compression_enabled").default(true),
  sslEnabled: boolean("ssl_enabled").default(true),
  sslCertificateId: varchar("ssl_certificate_id"),
  geoRestrictions: text("geo_restrictions").array().default(sql`ARRAY[]::text[]`),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertCdnDistributionSchema = createInsertSchema(cdnDistributions).omit({
  id: true,
  createdAt: true,
});

export type CdnDistribution = typeof cdnDistributions.$inferSelect;
export type InsertCdnDistribution = z.infer<typeof insertCdnDistributionSchema>;

// Billing Addresses - Store customer billing addresses for GST compliance
export const billingAddresses = pgTable("billing_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(), // State name for CGST+SGST vs IGST determination
  stateCode: text("state_code").notNull(), // 2-digit state code (01-37)
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("India"),
  gstNumber: text("gst_number"), // Can be different from user's primary GSTIN
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBillingAddressSchema = createInsertSchema(billingAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BillingAddress = typeof billingAddresses.$inferSelect;
export type InsertBillingAddress = z.infer<typeof insertBillingAddressSchema>;

// Invoices - Main invoice table with GST compliance
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(), // Sequential: INV-2024-0001
  userId: varchar("user_id").notNull().references(() => users.id),
  billingAddressId: varchar("billing_address_id").notNull().references(() => billingAddresses.id),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  
  // Amounts in INR (stored as integers in paise: 1 INR = 100 paise)
  subtotalAmount: integer("subtotal_amount").notNull(), // Base amount before tax
  cgstAmount: integer("cgst_amount").notNull().default(0), // Central GST (9%)
  sgstAmount: integer("sgst_amount").notNull().default(0), // State GST (9%)
  igstAmount: integer("igst_amount").notNull().default(0), // Integrated GST (18%)
  discountAmount: integer("discount_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(), // Final amount including tax
  
  // GST Compliance
  taxType: text("tax_type").notNull(), // "intra_state" (CGST+SGST) or "inter_state" (IGST)
  gstRate: integer("gst_rate").notNull().default(18), // 18% standard rate
  hsnCode: text("hsn_code").default("998314"), // HSN for cloud services
  sacCode: text("sac_code").default("998314"), // SAC for IT services
  placeOfSupply: text("place_of_supply").notNull(), // State name
  
  // E-Invoicing provisions (for future integration)
  einvoiceIrn: text("einvoice_irn"), // Invoice Reference Number from IRP
  einvoiceAckNo: text("einvoice_ack_no"), // Acknowledgment Number
  einvoiceAckDate: timestamp("einvoice_ack_date"), // Acknowledgment Date
  einvoiceQrCode: text("einvoice_qr_code"), // Base64 QR code
  einvoiceEnabled: boolean("einvoice_enabled").default(false),
  
  // Invoice status
  status: text("status").notNull().default("draft"), // draft, issued, paid, overdue, cancelled
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  
  // Metadata
  notes: text("notes"),
  currency: text("currency").notNull().default("INR"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Invoice Line Items - Itemized breakdown for each invoice
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  
  // Resource details
  resourceType: text("resource_type").notNull(), // vm, storage, network, database, kubernetes
  resourceId: varchar("resource_id"), // ID of the actual resource
  resourceName: text("resource_name").notNull(),
  description: text("description").notNull(),
  
  // Quantity and pricing (amounts in paise)
  quantity: integer("quantity").notNull(), // hours, GB, units
  unit: text("unit").notNull(), // hour, GB, unit
  unitPrice: integer("unit_price").notNull(), // price per unit in paise
  amount: integer("amount").notNull(), // quantity * unitPrice
  
  // Usage period
  usageStart: timestamp("usage_start"),
  usageEnd: timestamp("usage_end"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

// Usage Records - Track resource consumption for billing
export const usageRecords = pgTable("usage_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Resource identification
  resourceType: text("resource_type").notNull(), // vm, storage, network, database, kubernetes
  resourceId: varchar("resource_id").notNull(),
  resourceName: text("resource_name").notNull(),
  
  // Usage metrics
  metricType: text("metric_type").notNull(), // uptime, storage_gb, bandwidth_gb, requests
  quantity: integer("quantity").notNull(), // Amount consumed
  unit: text("unit").notNull(), // hour, GB, request
  
  // Pricing (amounts in paise)
  unitPrice: integer("unit_price").notNull(),
  totalCost: integer("total_cost").notNull(),
  
  // Time tracking
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Invoice association
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  billed: boolean("billed").default(false),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional resource-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUsageRecordSchema = createInsertSchema(usageRecords).omit({
  id: true,
  createdAt: true,
});

export type UsageRecord = typeof usageRecords.$inferSelect;
export type InsertUsageRecord = z.infer<typeof insertUsageRecordSchema>;

// Payment Methods - Store customer payment methods
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Gateway details
  gateway: text("gateway").notNull(), // razorpay, cashfree, stripe
  gatewayMethodId: text("gateway_method_id"), // ID from payment gateway
  
  // Payment method details
  type: text("type").notNull(), // card, upi, netbanking, wallet
  
  // Card details (masked for security)
  cardLast4: text("card_last4"),
  cardBrand: text("card_brand"), // visa, mastercard, rupay
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  
  // UPI details
  upiId: text("upi_id"), // user@bank
  
  // Status
  isDefault: boolean("is_default").default(false),
  status: text("status").notNull().default("active"), // active, expired, removed
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

// Payment Transactions - Track all payment attempts
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentMethodId: varchar("payment_method_id").references(() => paymentMethods.id),
  
  // Gateway details
  gateway: text("gateway").notNull(), // razorpay, cashfree
  gatewayTransactionId: text("gateway_transaction_id"), // Transaction ID from gateway
  gatewayOrderId: text("gateway_order_id"), // Order ID from gateway
  
  // Amount (in paise)
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, processing, success, failed, refunded
  paymentMethod: text("payment_method"), // card, upi, netbanking, wallet
  
  // Response data
  gatewayResponse: jsonb("gateway_response"), // Full response from gateway
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  // Timestamps
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

// Tax Calculations - Audit trail for GST logic
export const taxCalculations = pgTable("tax_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Tax determination logic
  supplierState: text("supplier_state").notNull(), // Your business state (Karnataka)
  supplierStateCode: text("supplier_state_code").notNull(), // 29 for Karnataka
  customerState: text("customer_state").notNull(),
  customerStateCode: text("customer_state_code").notNull(),
  
  // Tax type determination
  taxType: text("tax_type").notNull(), // intra_state, inter_state
  
  // Amounts (in paise)
  taxableAmount: integer("taxable_amount").notNull(),
  cgstRate: integer("cgst_rate").default(0), // 9
  sgstRate: integer("sgst_rate").default(0), // 9
  igstRate: integer("igst_rate").default(0), // 18
  cgstAmount: integer("cgst_amount").default(0),
  sgstAmount: integer("sgst_amount").default(0),
  igstAmount: integer("igst_amount").default(0),
  totalTaxAmount: integer("total_tax_amount").notNull(),
  
  // Compliance data
  gstRate: integer("gst_rate").notNull().default(18),
  hsnSacCode: text("hsn_sac_code").default("998314"),
  
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaxCalculationSchema = createInsertSchema(taxCalculations).omit({
  id: true,
  createdAt: true,
  calculatedAt: true,
});

export type TaxCalculation = typeof taxCalculations.$inferSelect;
export type InsertTaxCalculation = z.infer<typeof insertTaxCalculationSchema>;

// HSN/SAC Code Management - Configure tax codes for different services
export const hsnCodes = pgTable("hsn_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceType: text("service_type").notNull().unique(), // compute, storage, database, etc.
  hsnCode: text("hsn_code").notNull(), // HSN code for goods
  sacCode: text("sac_code").notNull(), // SAC code for services
  description: text("description").notNull(),
  gstRate: integer("gst_rate").notNull().default(18), // Default 18% for cloud services
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHsnCodeSchema = createInsertSchema(hsnCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HsnCode = typeof hsnCodes.$inferSelect;
export type InsertHsnCode = z.infer<typeof insertHsnCodeSchema>;
