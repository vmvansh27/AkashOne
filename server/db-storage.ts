import { db } from "./db";
import { 
  users, 
  roles, 
  permissions, 
  rolePermissions, 
  userRoles, 
  teamMembers,
  userActivities,
  billingAddresses,
  invoices,
  invoiceLineItems,
  usageRecords,
  paymentMethods,
  paymentTransactions,
  taxCalculations,
  hsnCodes,
  virtualMachines,
  vmSnapshots,
  kubernetesClusters,
  databases,
  vpcs,
  volumes,
  firewallRules,
  natGateways,
  sshKeys,
  isoImages,
  reservedIps,
  ipsecTunnels,
  loadBalancers,
  sslCertificates,
  objectStorageBuckets,
  ddosProtectionRules,
  cdnDistributions,
  dnsDomains,
  dnsRecords,
  featureFlags,
  servicePlans,
  discountCoupons,
  insertUserSchema,
  insertRoleSchema,
  insertPermissionSchema,
  insertRolePermissionSchema,
  insertUserRoleSchema,
  insertTeamMemberSchema,
  insertUserActivitySchema,
  insertBillingAddressSchema,
  insertInvoiceSchema,
  insertInvoiceLineItemSchema,
  insertUsageRecordSchema,
  insertPaymentMethodSchema,
  insertPaymentTransactionSchema,
  insertTaxCalculationSchema,
  insertHsnCodeSchema,
  insertVirtualMachineSchema,
  insertVMSnapshotSchema,
  insertKubernetesClusterSchema,
  insertDatabaseSchema,
  insertVpcSchema,
  insertVolumeSchema,
  insertFirewallRuleSchema,
  insertNatGatewaySchema,
  insertSshKeySchema,
  insertIsoImageSchema,
  insertReservedIpSchema,
  insertIpsecTunnelSchema,
  insertLoadBalancerSchema,
  insertSslCertificateSchema,
  insertObjectStorageBucketSchema,
  insertDdosProtectionRuleSchema,
  insertCdnDistributionSchema,
  insertDnsDomainSchema,
  insertDnsRecordSchema,
  insertFeatureFlagSchema,
  insertServicePlanSchema,
  insertDiscountCouponSchema
} from "@shared/schema";
import type {
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  TeamMember,
  UserActivity,
  BillingAddress,
  Invoice,
  InvoiceLineItem,
  UsageRecord,
  PaymentMethod,
  PaymentTransaction,
  TaxCalculation,
  HsnCode,
  VirtualMachine,
  VMSnapshot,
  KubernetesCluster,
  Database,
  Vpc,
  Volume,
  FirewallRule,
  NatGateway,
  SshKey,
  IsoImage,
  ReservedIp,
  IpsecTunnel,
  LoadBalancer,
  SslCertificate,
  ObjectStorageBucket,
  DdosProtectionRule,
  CdnDistribution,
  DnsDomain,
  DnsRecord,
  FeatureFlag,
  ServicePlan,
  DiscountCoupon
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { z } from "zod";
import type { IStorage } from "./storage";

type InsertUser = z.infer<typeof insertUserSchema>;
type InsertRole = z.infer<typeof insertRoleSchema>;
type InsertPermission = z.infer<typeof insertPermissionSchema>;
type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
type InsertBillingAddress = z.infer<typeof insertBillingAddressSchema>;
type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
type InsertUsageRecord = z.infer<typeof insertUsageRecordSchema>;
type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
type InsertTaxCalculation = z.infer<typeof insertTaxCalculationSchema>;
type InsertHsnCode = z.infer<typeof insertHsnCodeSchema>;
type InsertVirtualMachine = z.infer<typeof insertVirtualMachineSchema>;
type InsertVMSnapshot = z.infer<typeof insertVMSnapshotSchema>;
type InsertKubernetesCluster = z.infer<typeof insertKubernetesClusterSchema>;
type InsertDatabase = z.infer<typeof insertDatabaseSchema>;
type InsertVpc = z.infer<typeof insertVpcSchema>;
type InsertVolume = z.infer<typeof insertVolumeSchema>;
type InsertFirewallRule = z.infer<typeof insertFirewallRuleSchema>;
type InsertNatGateway = z.infer<typeof insertNatGatewaySchema>;
type InsertSshKey = z.infer<typeof insertSshKeySchema>;
type InsertIsoImage = z.infer<typeof insertIsoImageSchema>;
type InsertReservedIp = z.infer<typeof insertReservedIpSchema>;
type InsertIpsecTunnel = z.infer<typeof insertIpsecTunnelSchema>;
type InsertLoadBalancer = z.infer<typeof insertLoadBalancerSchema>;
type InsertSslCertificate = z.infer<typeof insertSslCertificateSchema>;
type InsertObjectStorageBucket = z.infer<typeof insertObjectStorageBucketSchema>;
type InsertDdosProtectionRule = z.infer<typeof insertDdosProtectionRuleSchema>;
type InsertCdnDistribution = z.infer<typeof insertCdnDistributionSchema>;
type InsertDnsDomain = z.infer<typeof insertDnsDomainSchema>;
type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;
type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
type InsertServicePlan = z.infer<typeof insertServicePlanSchema>;
type InsertDiscountCoupon = z.infer<typeof insertDiscountCouponSchema>;

export class DatabaseStorage implements Partial<IStorage> {
  // ========== USER METHODS ==========
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return await db.select().from(users)
      .where(eq(users.organizationId, organizationId));
  }

  // ========== ROLE METHODS ==========

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async getRoleById(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const [updated] = await db.update(roles)
      .set(updates)
      .where(eq(roles.id, id))
      .returning();
    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== PERMISSION METHODS ==========

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db.insert(permissions).values(permission).returning();
    return newPermission;
  }

  async getPermissionById(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission> {
    const [updated] = await db.update(permissions)
      .set(updates)
      .where(eq(permissions.id, id))
      .returning();
    return updated;
  }

  async deletePermission(id: string): Promise<boolean> {
    const result = await db.delete(permissions).where(eq(permissions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== ROLE-PERMISSION METHODS ==========

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    const [newRolePermission] = await db.insert(rolePermissions)
      .values({ roleId, permissionId })
      .returning();
    return newRolePermission;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const result = await db.delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        )
      );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPermissionsForRole(roleId: string): Promise<Permission[]> {
    const result = await db
      .select({ permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    
    return result.map(r => r.permission);
  }

  async getRolesForPermission(permissionId: string): Promise<Role[]> {
    const result = await db
      .select({ role: roles })
      .from(rolePermissions)
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .where(eq(rolePermissions.permissionId, permissionId));
    
    return result.map(r => r.role);
  }

  // ========== USER-ROLE METHODS ==========

  async assignRoleToUser(userId: string, roleId: string, grantedBy: string): Promise<UserRole> {
    const [newUserRole] = await db.insert(userRoles)
      .values({ userId, roleId, grantedBy })
      .returning();
    return newUserRole;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const result = await db.delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getRolesForUser(userId: string): Promise<Role[]> {
    const result = await db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    
    return result.map(r => r.role);
  }

  async getUsersForRole(roleId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .where(eq(userRoles.roleId, roleId));
    
    return result.map(r => r.user);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const result = await db
      .select({ permission: permissions })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));
    
    return result.map(r => r.permission);
  }

  // ========== TEAM MEMBER METHODS ==========

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newTeamMember] = await db.insert(teamMembers)
      .values(teamMember)
      .returning();
    return newTeamMember;
  }

  async getTeamMemberById(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async getTeamMembersByOrganization(organizationId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.organizationId, organizationId));
  }

  async getTeamMembersByUser(userId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.userId, userId));
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const [updated] = await db.update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== USER ACTIVITY METHODS ==========

  async logUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db.insert(userActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getUserActivities(userId: string, limit?: number): Promise<UserActivity[]> {
    let query = db.select().from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(userActivities.createdAt);
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async getOrganizationActivities(organizationId: string, limit?: number): Promise<UserActivity[]> {
    // Note: userActivities table doesn't have organizationId, so we need to join with users
    // For now, return empty array - this needs to be implemented properly
    return [];
  }

  // ========== BILLING ADDRESS METHODS ==========

  async getBillingAddresses(userId: string): Promise<BillingAddress[]> {
    return await db.select().from(billingAddresses).where(eq(billingAddresses.userId, userId));
  }

  async getBillingAddressById(id: string): Promise<BillingAddress | undefined> {
    const [address] = await db.select().from(billingAddresses).where(eq(billingAddresses.id, id));
    return address;
  }

  async createBillingAddress(address: InsertBillingAddress & { userId: string }): Promise<BillingAddress> {
    const [newAddress] = await db.insert(billingAddresses).values(address).returning();
    return newAddress;
  }

  async updateBillingAddress(id: string, updates: Partial<BillingAddress>): Promise<BillingAddress | undefined> {
    const [updated] = await db.update(billingAddresses)
      .set(updates)
      .where(eq(billingAddresses.id, id))
      .returning();
    return updated;
  }

  async deleteBillingAddress(id: string): Promise<boolean> {
    const result = await db.delete(billingAddresses).where(eq(billingAddresses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== INVOICE METHODS ==========

  async getInvoices(userId: string): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  // ========== INVOICE LINE ITEM METHODS ==========

  async getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    return await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
  }

  async createInvoiceLineItem(item: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    const [newItem] = await db.insert(invoiceLineItems).values(item).returning();
    return newItem;
  }

  // ========== USAGE RECORD METHODS ==========

  async getUsageRecords(userId: string): Promise<UsageRecord[]> {
    return await db.select().from(usageRecords).where(eq(usageRecords.userId, userId));
  }

  async getUsageRecordsByResource(userId: string, resourceType: string, resourceId: string): Promise<UsageRecord[]> {
    return await db.select().from(usageRecords)
      .where(
        and(
          eq(usageRecords.userId, userId),
          eq(usageRecords.resourceType, resourceType),
          eq(usageRecords.resourceId, resourceId)
        )
      );
  }

  async getUnbilledUsageRecords(userId: string): Promise<UsageRecord[]> {
    return await db.select().from(usageRecords)
      .where(
        and(
          eq(usageRecords.userId, userId),
          eq(usageRecords.invoiceId, null as any) // Not yet billed
        )
      );
  }

  async createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord> {
    const [newRecord] = await db.insert(usageRecords).values(record).returning();
    return newRecord;
  }

  async updateUsageRecord(id: string, updates: Partial<UsageRecord>): Promise<UsageRecord | undefined> {
    const [updated] = await db.update(usageRecords)
      .set(updates)
      .where(eq(usageRecords.id, id))
      .returning();
    return updated;
  }

  // ========== PAYMENT METHOD METHODS ==========

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method;
  }

  async createPaymentMethod(method: InsertPaymentMethod & { userId: string }): Promise<PaymentMethod> {
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods)
      .set(updates)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== PAYMENT TRANSACTION METHODS ==========

  async getPaymentTransactions(userId: string): Promise<PaymentTransaction[]> {
    return await db.select().from(paymentTransactions).where(eq(paymentTransactions.userId, userId));
  }

  async getPaymentTransactionById(id: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    return transaction;
  }

  async getPaymentTransactionsByInvoice(invoiceId: string): Promise<PaymentTransaction[]> {
    return await db.select().from(paymentTransactions).where(eq(paymentTransactions.invoiceId, invoiceId));
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [newTransaction] = await db.insert(paymentTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const [updated] = await db.update(paymentTransactions)
      .set(updates)
      .where(eq(paymentTransactions.id, id))
      .returning();
    return updated;
  }

  // ========== TAX CALCULATION METHODS ==========

  async getTaxCalculationByInvoice(invoiceId: string): Promise<TaxCalculation | undefined> {
    const [calc] = await db.select().from(taxCalculations).where(eq(taxCalculations.invoiceId, invoiceId));
    return calc;
  }

  async createTaxCalculation(calculation: InsertTaxCalculation): Promise<TaxCalculation> {
    const [newCalc] = await db.insert(taxCalculations).values(calculation).returning();
    return newCalc;
  }

  // ========== HSN CODE METHODS ==========

  async getAllHsnCodes(): Promise<HsnCode[]> {
    return await db.select().from(hsnCodes);
  }

  async getHsnCodeById(id: string): Promise<HsnCode | undefined> {
    const [code] = await db.select().from(hsnCodes).where(eq(hsnCodes.id, id));
    return code;
  }

  async getHsnCodeByCode(serviceType: string): Promise<HsnCode | undefined> {
    const [hsnCode] = await db.select().from(hsnCodes).where(eq(hsnCodes.serviceType, serviceType));
    return hsnCode;
  }

  async createHsnCode(code: InsertHsnCode): Promise<HsnCode> {
    const [newCode] = await db.insert(hsnCodes).values(code).returning();
    return newCode;
  }

  async updateHsnCode(id: string, data: Partial<HsnCode>): Promise<HsnCode | undefined> {
    const [updated] = await db.update(hsnCodes)
      .set(data)
      .where(eq(hsnCodes.id, id))
      .returning();
    return updated;
  }

  async deleteHsnCode(id: string): Promise<boolean> {
    const result = await db.delete(hsnCodes).where(eq(hsnCodes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== VIRTUAL MACHINE METHODS ==========

  async getVirtualMachines(userId: string): Promise<VirtualMachine[]> {
    return await db.select().from(virtualMachines).where(eq(virtualMachines.userId, userId));
  }

  async getVirtualMachineById(id: string): Promise<VirtualMachine | undefined> {
    const [vm] = await db.select().from(virtualMachines).where(eq(virtualMachines.id, id));
    return vm;
  }

  async createVirtualMachine(vm: InsertVirtualMachine & { userId: string; cloudstackId: string }): Promise<VirtualMachine> {
    const [newVM] = await db.insert(virtualMachines).values(vm).returning();
    return newVM;
  }

  async updateVirtualMachine(id: string, updates: Partial<VirtualMachine>): Promise<VirtualMachine | undefined> {
    const [updated] = await db.update(virtualMachines)
      .set(updates)
      .where(eq(virtualMachines.id, id))
      .returning();
    return updated;
  }

  async deleteVirtualMachine(id: string): Promise<boolean> {
    const result = await db.delete(virtualMachines).where(eq(virtualMachines.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== VM SNAPSHOT METHODS ==========

  async getVMSnapshots(vmId: string): Promise<VMSnapshot[]> {
    return await db.select().from(vmSnapshots).where(eq(vmSnapshots.vmId, vmId));
  }

  async getVMSnapshotById(id: string): Promise<VMSnapshot | undefined> {
    const [snapshot] = await db.select().from(vmSnapshots).where(eq(vmSnapshots.id, id));
    return snapshot;
  }

  async createVMSnapshot(snapshot: InsertVMSnapshot & { userId: string; cloudstackSnapshotId: string }): Promise<VMSnapshot> {
    const [newSnapshot] = await db.insert(vmSnapshots).values(snapshot).returning();
    return newSnapshot;
  }

  async deleteVMSnapshot(id: string): Promise<boolean> {
    const result = await db.delete(vmSnapshots).where(eq(vmSnapshots.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== KUBERNETES CLUSTER METHODS ==========

  async getKubernetesClusters(userId: string): Promise<KubernetesCluster[]> {
    return await db.select().from(kubernetesClusters).where(eq(kubernetesClusters.userId, userId));
  }

  async getKubernetesClusterById(id: string): Promise<KubernetesCluster | undefined> {
    const [cluster] = await db.select().from(kubernetesClusters).where(eq(kubernetesClusters.id, id));
    return cluster;
  }

  async createKubernetesCluster(cluster: InsertKubernetesCluster & { userId: string }): Promise<KubernetesCluster> {
    const [newCluster] = await db.insert(kubernetesClusters).values(cluster).returning();
    return newCluster;
  }

  async updateKubernetesCluster(id: string, updates: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined> {
    const [updated] = await db.update(kubernetesClusters)
      .set(updates)
      .where(eq(kubernetesClusters.id, id))
      .returning();
    return updated;
  }

  async deleteKubernetesCluster(id: string): Promise<boolean> {
    const result = await db.delete(kubernetesClusters).where(eq(kubernetesClusters.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== DATABASE METHODS ==========

  async getDatabases(userId: string): Promise<Database[]> {
    return await db.select().from(databases).where(eq(databases.userId, userId));
  }

  async getDatabaseById(id: string): Promise<Database | undefined> {
    const [database] = await db.select().from(databases).where(eq(databases.id, id));
    return database;
  }

  async createDatabase(database: InsertDatabase & { userId: string }): Promise<Database> {
    const [newDB] = await db.insert(databases).values(database as typeof databases.$inferInsert).returning();
    return newDB;
  }

  async updateDatabase(id: string, updates: Partial<Database>): Promise<Database | undefined> {
    const [updated] = await db.update(databases)
      .set(updates)
      .where(eq(databases.id, id))
      .returning();
    return updated;
  }

  async deleteDatabase(id: string): Promise<boolean> {
    const result = await db.delete(databases).where(eq(databases.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== VPC METHODS ==========

  async getVpcs(userId: string): Promise<Vpc[]> {
    return await db.select().from(vpcs).where(eq(vpcs.userId, userId));
  }

  async getVpcById(id: string): Promise<Vpc | undefined> {
    const [vpc] = await db.select().from(vpcs).where(eq(vpcs.id, id));
    return vpc;
  }

  async createVpc(vpc: InsertVpc & { userId: string; cloudstackId: string }): Promise<Vpc> {
    const [newVpc] = await db.insert(vpcs).values(vpc).returning();
    return newVpc;
  }

  async updateVpc(id: string, updates: Partial<Vpc>): Promise<Vpc | undefined> {
    const [updated] = await db.update(vpcs)
      .set(updates)
      .where(eq(vpcs.id, id))
      .returning();
    return updated;
  }

  async deleteVpc(id: string): Promise<boolean> {
    const result = await db.delete(vpcs).where(eq(vpcs.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== VOLUME (BLOCK STORAGE) METHODS ==========

  async getVolumes(userId: string): Promise<Volume[]> {
    return await db.select().from(volumes).where(eq(volumes.userId, userId));
  }

  async getVolumeById(id: string): Promise<Volume | undefined> {
    const [volume] = await db.select().from(volumes).where(eq(volumes.id, id));
    return volume;
  }

  async createVolume(volume: InsertVolume & { userId: string; cloudstackId: string }): Promise<Volume> {
    const [newVolume] = await db.insert(volumes).values(volume).returning();
    return newVolume;
  }

  async updateVolume(id: string, updates: Partial<Volume>): Promise<Volume | undefined> {
    const [updated] = await db.update(volumes)
      .set(updates)
      .where(eq(volumes.id, id))
      .returning();
    return updated;
  }

  async deleteVolume(id: string): Promise<boolean> {
    const result = await db.delete(volumes).where(eq(volumes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== FIREWALL RULE METHODS ==========

  async getFirewallRules(userId: string): Promise<FirewallRule[]> {
    return await db.select().from(firewallRules).where(eq(firewallRules.userId, userId));
  }

  async getFirewallRuleById(id: string): Promise<FirewallRule | undefined> {
    const [rule] = await db.select().from(firewallRules).where(eq(firewallRules.id, id));
    return rule;
  }

  async createFirewallRule(rule: InsertFirewallRule & { userId: string; cloudstackId: string }): Promise<FirewallRule> {
    const [newRule] = await db.insert(firewallRules).values(rule).returning();
    return newRule;
  }

  async updateFirewallRule(id: string, updates: Partial<FirewallRule>): Promise<FirewallRule | undefined> {
    const [updated] = await db.update(firewallRules)
      .set(updates)
      .where(eq(firewallRules.id, id))
      .returning();
    return updated;
  }

  async deleteFirewallRule(id: string): Promise<boolean> {
    const result = await db.delete(firewallRules).where(eq(firewallRules.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== NAT GATEWAY METHODS ==========

  async getNatGateways(userId: string): Promise<NatGateway[]> {
    return await db.select().from(natGateways).where(eq(natGateways.userId, userId));
  }

  async getNatGatewayById(id: string): Promise<NatGateway | undefined> {
    const [nat] = await db.select().from(natGateways).where(eq(natGateways.id, id));
    return nat;
  }

  async createNatGateway(nat: InsertNatGateway & { userId: string; cloudstackId: string }): Promise<NatGateway> {
    const [newNat] = await db.insert(natGateways).values(nat).returning();
    return newNat;
  }

  async updateNatGateway(id: string, updates: Partial<NatGateway>): Promise<NatGateway | undefined> {
    const [updated] = await db.update(natGateways)
      .set(updates)
      .where(eq(natGateways.id, id))
      .returning();
    return updated;
  }

  async deleteNatGateway(id: string): Promise<boolean> {
    const result = await db.delete(natGateways).where(eq(natGateways.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== SSH KEY METHODS ==========

  async getSshKeys(userId: string): Promise<SshKey[]> {
    return await db.select().from(sshKeys).where(eq(sshKeys.userId, userId));
  }

  async getSshKeyById(id: string): Promise<SshKey | undefined> {
    const [key] = await db.select().from(sshKeys).where(eq(sshKeys.id, id));
    return key;
  }

  async createSshKey(key: InsertSshKey & { userId: string }): Promise<SshKey> {
    const [newKey] = await db.insert(sshKeys).values(key).returning();
    return newKey;
  }

  async updateSshKey(id: string, updates: Partial<SshKey>): Promise<SshKey | undefined> {
    const [updated] = await db.update(sshKeys)
      .set(updates)
      .where(eq(sshKeys.id, id))
      .returning();
    return updated;
  }

  async deleteSshKey(id: string): Promise<boolean> {
    const result = await db.delete(sshKeys).where(eq(sshKeys.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== ISO IMAGE METHODS ==========

  async getIsoImages(userId: string): Promise<IsoImage[]> {
    return await db.select().from(isoImages).where(eq(isoImages.userId, userId));
  }

  async getIsoImageById(id: string): Promise<IsoImage | undefined> {
    const [iso] = await db.select().from(isoImages).where(eq(isoImages.id, id));
    return iso;
  }

  async createIsoImage(iso: InsertIsoImage & { userId: string; cloudstackId: string }): Promise<IsoImage> {
    const [newIso] = await db.insert(isoImages).values(iso).returning();
    return newIso;
  }

  async updateIsoImage(id: string, updates: Partial<IsoImage>): Promise<IsoImage | undefined> {
    const [updated] = await db.update(isoImages)
      .set(updates)
      .where(eq(isoImages.id, id))
      .returning();
    return updated;
  }

  async deleteIsoImage(id: string): Promise<boolean> {
    const result = await db.delete(isoImages).where(eq(isoImages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== RESERVED IP METHODS ==========

  async getReservedIps(userId: string): Promise<ReservedIp[]> {
    return await db.select().from(reservedIps).where(eq(reservedIps.userId, userId));
  }

  async getReservedIpById(id: string): Promise<ReservedIp | undefined> {
    const [ip] = await db.select().from(reservedIps).where(eq(reservedIps.id, id));
    return ip;
  }

  async createReservedIp(ip: InsertReservedIp & { userId: string; cloudstackId: string }): Promise<ReservedIp> {
    const [newIp] = await db.insert(reservedIps).values(ip).returning();
    return newIp;
  }

  async updateReservedIp(id: string, updates: Partial<ReservedIp>): Promise<ReservedIp | undefined> {
    const [updated] = await db.update(reservedIps)
      .set(updates)
      .where(eq(reservedIps.id, id))
      .returning();
    return updated;
  }

  async deleteReservedIp(id: string): Promise<boolean> {
    const result = await db.delete(reservedIps).where(eq(reservedIps.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== IPSEC TUNNEL METHODS ==========

  async getIpsecTunnels(userId: string): Promise<IpsecTunnel[]> {
    return await db.select().from(ipsecTunnels).where(eq(ipsecTunnels.userId, userId));
  }

  async getIpsecTunnelById(id: string): Promise<IpsecTunnel | undefined> {
    const [tunnel] = await db.select().from(ipsecTunnels).where(eq(ipsecTunnels.id, id));
    return tunnel;
  }

  async createIpsecTunnel(tunnel: InsertIpsecTunnel & { userId: string; cloudstackId: string }): Promise<IpsecTunnel> {
    const [newTunnel] = await db.insert(ipsecTunnels).values(tunnel).returning();
    return newTunnel;
  }

  async updateIpsecTunnel(id: string, updates: Partial<IpsecTunnel>): Promise<IpsecTunnel | undefined> {
    const [updated] = await db.update(ipsecTunnels)
      .set(updates)
      .where(eq(ipsecTunnels.id, id))
      .returning();
    return updated;
  }

  async deleteIpsecTunnel(id: string): Promise<boolean> {
    const result = await db.delete(ipsecTunnels).where(eq(ipsecTunnels.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== LOAD BALANCER METHODS ==========

  async getLoadBalancers(userId: string): Promise<LoadBalancer[]> {
    return await db.select().from(loadBalancers).where(eq(loadBalancers.userId, userId));
  }

  async getLoadBalancerById(id: string): Promise<LoadBalancer | undefined> {
    const [lb] = await db.select().from(loadBalancers).where(eq(loadBalancers.id, id));
    return lb;
  }

  async createLoadBalancer(lb: InsertLoadBalancer & { userId: string; cloudstackId: string }): Promise<LoadBalancer> {
    const [newLB] = await db.insert(loadBalancers).values(lb).returning();
    return newLB;
  }

  async updateLoadBalancer(id: string, updates: Partial<LoadBalancer>): Promise<LoadBalancer | undefined> {
    const [updated] = await db.update(loadBalancers)
      .set(updates)
      .where(eq(loadBalancers.id, id))
      .returning();
    return updated;
  }

  async deleteLoadBalancer(id: string): Promise<boolean> {
    const result = await db.delete(loadBalancers).where(eq(loadBalancers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== SSL CERTIFICATE METHODS ==========

  async getSslCertificates(userId: string): Promise<SslCertificate[]> {
    return await db.select().from(sslCertificates).where(eq(sslCertificates.userId, userId));
  }

  async getSslCertificateById(id: string): Promise<SslCertificate | undefined> {
    const [cert] = await db.select().from(sslCertificates).where(eq(sslCertificates.id, id));
    return cert;
  }

  async createSslCertificate(cert: InsertSslCertificate & { userId: string; cloudstackId: string }): Promise<SslCertificate> {
    const [newCert] = await db.insert(sslCertificates).values(cert).returning();
    return newCert;
  }

  async updateSslCertificate(id: string, updates: Partial<SslCertificate>): Promise<SslCertificate | undefined> {
    const [updated] = await db.update(sslCertificates)
      .set(updates)
      .where(eq(sslCertificates.id, id))
      .returning();
    return updated;
  }

  async deleteSslCertificate(id: string): Promise<boolean> {
    const result = await db.delete(sslCertificates).where(eq(sslCertificates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== OBJECT STORAGE BUCKET METHODS ==========

  async getObjectStorageBuckets(userId: string): Promise<ObjectStorageBucket[]> {
    return await db.select().from(objectStorageBuckets).where(eq(objectStorageBuckets.userId, userId));
  }

  async getObjectStorageBucketById(id: string): Promise<ObjectStorageBucket | undefined> {
    const [bucket] = await db.select().from(objectStorageBuckets).where(eq(objectStorageBuckets.id, id));
    return bucket;
  }

  async createObjectStorageBucket(bucket: InsertObjectStorageBucket & { userId: string; cloudstackId: string }): Promise<ObjectStorageBucket> {
    const [newBucket] = await db.insert(objectStorageBuckets).values(bucket).returning();
    return newBucket;
  }

  async updateObjectStorageBucket(id: string, updates: Partial<ObjectStorageBucket>): Promise<ObjectStorageBucket | undefined> {
    const [updated] = await db.update(objectStorageBuckets)
      .set(updates)
      .where(eq(objectStorageBuckets.id, id))
      .returning();
    return updated;
  }

  async deleteObjectStorageBucket(id: string): Promise<boolean> {
    const result = await db.delete(objectStorageBuckets).where(eq(objectStorageBuckets.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== DDOS PROTECTION RULE METHODS ==========

  async getDdosProtectionRules(userId: string): Promise<DdosProtectionRule[]> {
    return await db.select().from(ddosProtectionRules).where(eq(ddosProtectionRules.userId, userId));
  }

  async getDdosProtectionRuleById(id: string): Promise<DdosProtectionRule | undefined> {
    const [rule] = await db.select().from(ddosProtectionRules).where(eq(ddosProtectionRules.id, id));
    return rule;
  }

  async createDdosProtectionRule(rule: InsertDdosProtectionRule & { userId: string; cloudstackId: string }): Promise<DdosProtectionRule> {
    const [newRule] = await db.insert(ddosProtectionRules).values(rule).returning();
    return newRule;
  }

  async updateDdosProtectionRule(id: string, updates: Partial<DdosProtectionRule>): Promise<DdosProtectionRule | undefined> {
    const [updated] = await db.update(ddosProtectionRules)
      .set(updates)
      .where(eq(ddosProtectionRules.id, id))
      .returning();
    return updated;
  }

  async deleteDdosProtectionRule(id: string): Promise<boolean> {
    const result = await db.delete(ddosProtectionRules).where(eq(ddosProtectionRules.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== CDN DISTRIBUTION METHODS ==========

  async getCdnDistributions(userId: string): Promise<CdnDistribution[]> {
    return await db.select().from(cdnDistributions).where(eq(cdnDistributions.userId, userId));
  }

  async getCdnDistributionById(id: string): Promise<CdnDistribution | undefined> {
    const [cdn] = await db.select().from(cdnDistributions).where(eq(cdnDistributions.id, id));
    return cdn;
  }

  async createCdnDistribution(cdn: InsertCdnDistribution & { userId: string; cloudstackId: string }): Promise<CdnDistribution> {
    const [newCDN] = await db.insert(cdnDistributions).values(cdn).returning();
    return newCDN;
  }

  async updateCdnDistribution(id: string, updates: Partial<CdnDistribution>): Promise<CdnDistribution | undefined> {
    const [updated] = await db.update(cdnDistributions)
      .set(updates)
      .where(eq(cdnDistributions.id, id))
      .returning();
    return updated;
  }

  async deleteCdnDistribution(id: string): Promise<boolean> {
    const result = await db.delete(cdnDistributions).where(eq(cdnDistributions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== DNS DOMAIN METHODS ==========

  async getDnsDomains(userId: string): Promise<DnsDomain[]> {
    return await db.select().from(dnsDomains).where(eq(dnsDomains.userId, userId));
  }

  async getDnsDomainById(id: string): Promise<DnsDomain | undefined> {
    const [domain] = await db.select().from(dnsDomains).where(eq(dnsDomains.id, id));
    return domain;
  }

  async createDnsDomain(domain: InsertDnsDomain & { userId: string }): Promise<DnsDomain> {
    const [newDomain] = await db.insert(dnsDomains).values(domain).returning();
    return newDomain;
  }

  async updateDnsDomain(id: string, updates: Partial<DnsDomain>): Promise<DnsDomain | undefined> {
    const [updated] = await db.update(dnsDomains)
      .set(updates)
      .where(eq(dnsDomains.id, id))
      .returning();
    return updated;
  }

  async deleteDnsDomain(id: string): Promise<boolean> {
    const result = await db.delete(dnsDomains).where(eq(dnsDomains.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== DNS RECORD METHODS ==========

  async getDnsRecords(domainId: string): Promise<DnsRecord[]> {
    return await db.select().from(dnsRecords).where(eq(dnsRecords.domainId, domainId));
  }

  async getDnsRecordById(id: string): Promise<DnsRecord | undefined> {
    const [record] = await db.select().from(dnsRecords).where(eq(dnsRecords.id, id));
    return record;
  }

  async createDnsRecord(record: InsertDnsRecord & { userId: string }): Promise<DnsRecord> {
    const [newRecord] = await db.insert(dnsRecords).values(record).returning();
    return newRecord;
  }

  async updateDnsRecord(id: string, updates: Partial<DnsRecord>): Promise<DnsRecord | undefined> {
    const [updated] = await db.update(dnsRecords)
      .set(updates)
      .where(eq(dnsRecords.id, id))
      .returning();
    return updated;
  }

  async deleteDnsRecord(id: string): Promise<boolean> {
    const result = await db.delete(dnsRecords).where(eq(dnsRecords.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== FEATURE FLAG METHODS ==========

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return await db.select().from(featureFlags);
  }

  async getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    return flag;
  }

  async createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag> {
    const [newFlag] = await db.insert(featureFlags).values(flag).returning();
    return newFlag;
  }

  async updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | undefined> {
    const [updated] = await db.update(featureFlags)
      .set(updates)
      .where(eq(featureFlags.id, id))
      .returning();
    return updated;
  }

  async deleteFeatureFlag(id: string): Promise<boolean> {
    const result = await db.delete(featureFlags).where(eq(featureFlags.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== SERVICE PLAN METHODS ==========

  async getServicePlans(): Promise<ServicePlan[]> {
    return await db.select().from(servicePlans);
  }

  async getServicePlanById(id: string): Promise<ServicePlan | undefined> {
    const [plan] = await db.select().from(servicePlans).where(eq(servicePlans.id, id));
    return plan;
  }

  async createServicePlan(plan: InsertServicePlan): Promise<ServicePlan> {
    const [newPlan] = await db.insert(servicePlans).values(plan).returning();
    return newPlan;
  }

  async updateServicePlan(id: string, updates: Partial<ServicePlan>): Promise<ServicePlan | undefined> {
    const [updated] = await db.update(servicePlans)
      .set(updates)
      .where(eq(servicePlans.id, id))
      .returning();
    return updated;
  }

  async deleteServicePlan(id: string): Promise<boolean> {
    const result = await db.delete(servicePlans).where(eq(servicePlans.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== DISCOUNT COUPON METHODS ==========

  async getDiscountCoupons(): Promise<DiscountCoupon[]> {
    return await db.select().from(discountCoupons);
  }

  async getDiscountCouponById(id: string): Promise<DiscountCoupon | undefined> {
    const [coupon] = await db.select().from(discountCoupons).where(eq(discountCoupons.id, id));
    return coupon;
  }

  async getDiscountCouponByCode(code: string): Promise<DiscountCoupon | undefined> {
    const [coupon] = await db.select().from(discountCoupons).where(eq(discountCoupons.code, code));
    return coupon;
  }

  async createDiscountCoupon(coupon: InsertDiscountCoupon): Promise<DiscountCoupon> {
    const [newCoupon] = await db.insert(discountCoupons).values(coupon).returning();
    return newCoupon;
  }

  async updateDiscountCoupon(id: string, updates: Partial<DiscountCoupon>): Promise<DiscountCoupon | undefined> {
    const [updated] = await db.update(discountCoupons)
      .set(updates)
      .where(eq(discountCoupons.id, id))
      .returning();
    return updated;
  }

  async deleteDiscountCoupon(id: string): Promise<boolean> {
    const result = await db.delete(discountCoupons).where(eq(discountCoupons.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}
