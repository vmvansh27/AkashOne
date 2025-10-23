# PostgreSQL Migration Guide

## Overview
This guide walks you through migrating AkashOne.com from in-memory storage (MemStorage) to persistent PostgreSQL storage using Drizzle ORM.

**Current Status:**
- ✅ PostgreSQL database created and connected
- ✅ Database connection configured in `server/db.ts`
- ✅ All schemas defined in `shared/schema.ts`
- ⏳ Storage layer still using MemStorage (2654 lines to migrate)

## Why Migrate Now?

**Critical for Production:**
- **Data Persistence**: All data currently lost on server restart
- **Multi-tenant Isolation**: Database provides better security boundaries
- **Scalability**: PostgreSQL supports concurrent users and large datasets
- **GST Compliance**: Invoices and billing records must be permanent
- **Audit Trail**: User activity logs require persistence

## Migration Approach

### Option 1: Gradual Migration (Recommended)
Migrate feature-by-feature to minimize risk:

1. **Phase 1: Core User Management** (1-2 hours)
   - Users, roles, permissions, team members
   - Most critical for RBAC functionality
   
2. **Phase 2: Billing & GST** (2-3 hours)
   - Billing addresses, invoices, usage records
   - Critical for revenue and compliance
   
3. **Phase 3: CloudStack Resources** (2-4 hours)
   - VMs, networks, storage, K8s, databases
   - Can be done incrementally per resource type

4. **Phase 4: Feature Management** (30 mins)
   - Feature flags, service plans, HSN/SAC codes

### Option 2: Complete Migration (Faster but Riskier)
Replace entire MemStorage with DatabaseStorage in one go.

## Step-by-Step Instructions

### Prerequisites
```bash
# Ensure database is created (already done)
# Check DATABASE_URL secret is set
echo $DATABASE_URL
```

### Phase 1: User Management Migration

#### 1.1 Create DatabaseStorage Class
Create `server/db-storage.ts`:

```typescript
import { db } from "./db";
import { users, roles, permissions, rolePermissions, userRoles, teamMembers } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { IStorage, InsertUser, User } from "./storage";

export class DatabaseStorage implements Partial<IStorage> {
  // User Methods
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

  // Add more methods as needed...
}
```

#### 1.2 Update Storage Instance
In `server/storage.ts`, add hybrid support:

```typescript
import { DatabaseStorage } from "./db-storage";

const USE_DATABASE = process.env.USE_DATABASE === "true";

export const storage: IStorage = USE_DATABASE 
  ? new DatabaseStorage() as IStorage
  : new MemStorage();
```

#### 1.3 Push Schema to Database
```bash
npm run db:push
```

#### 1.4 Test User Endpoints
Set environment variable and test:
```bash
# In .env or Replit Secrets
USE_DATABASE=true

# Test registration, login, password change
# Verify data persists after server restart
```

### Phase 2: Billing Migration

Follow similar pattern for billing tables:
- billing_addresses
- invoices
- invoice_line_items
- usage_records
- payment_methods
- payment_transactions
- tax_calculations

**Key considerations:**
- Maintain integer paise precision
- Preserve fractional paise in usage_records
- Ensure GST calculations remain accurate

### Phase 3: CloudStack Resources

Migrate each resource type:
- virtual_machines
- kubernetes_clusters
- databases
- vpcs
- firewall_rules
- volumes
- (and 15+ more CloudStack tables)

**Important:**
- Keep `cloudstackId` unique constraints
- Preserve userId for multi-tenant isolation
- Maintain resource state consistency

### Phase 4: Feature Management

Migrate remaining tables:
- feature_flags
- service_plans
- hsn_sac_codes

## Testing Checklist

After each phase migration:

- [ ] Server starts without errors
- [ ] Data persists after restart
- [ ] All API endpoints return correct data
- [ ] RBAC rules still enforced
- [ ] No data loss compared to MemStorage
- [ ] Performance is acceptable

## Rollback Plan

If migration fails:

```bash
# Set USE_DATABASE=false in environment
# Server will fall back to MemStorage
USE_DATABASE=false
```

## Performance Optimization

After migration:

1. **Add Indexes** for frequently queried fields:
```typescript
// In schema definitions
index("user_email_idx").on(users.email),
index("invoice_user_idx").on(invoices.userId),
```

2. **Connection Pooling** (already configured in `server/db.ts`)

3. **Query Optimization** using Drizzle's query builder

## Common Issues & Solutions

### Issue 1: Type Mismatches
**Problem:** TypeScript errors with nullable fields in billing tables

**Solution:** Use proper Drizzle column modifiers:
```typescript
// Instead of: column.notNull()
// Use: column (allows null by default)
totalAmountPaise: integer("total_amount_paise"),
```

### Issue 2: UUID Generation
**Problem:** Manual UUID generation in MemStorage vs automatic in DB

**Solution:** Use database-generated UUIDs:
```typescript
id: varchar("id").primaryKey().default(sql`gen_random_uuid()`)
```

### Issue 3: Array Columns
**Problem:** JSON arrays in MemStorage vs PostgreSQL arrays

**Solution:** Use `.array()` method:
```typescript
features: text("features").array(),
```

## Estimated Timeline

- **Minimal Viable Migration** (User + Billing): 3-5 hours
- **Complete Migration** (All features): 8-12 hours
- **Testing & Bug Fixes**: 2-4 hours

**Total**: 1-2 days for full production-ready migration

## Next Steps

1. **Backup Current State**: Create checkpoint before starting
2. **Start with Phase 1**: User management migration
3. **Test Thoroughly**: Verify each phase before proceeding
4. **Monitor Performance**: Check database query times
5. **Update Documentation**: Reflect changes in replit.md

## Support Resources

- **Drizzle ORM Docs**: https://orm.drizzle.team/docs/overview
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Neon Database**: https://neon.tech/docs/introduction

---

**Note**: The 14 TypeScript warnings in `server/storage.ts` are related to billing method signatures and don't affect functionality. They can be fixed during Phase 2 migration.
