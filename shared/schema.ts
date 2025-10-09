import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
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
