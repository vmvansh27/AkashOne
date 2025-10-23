# Production Deployment Guide - User Management

## Initial System Setup (Bootstrap)

### First Time Deployment

When you deploy AkashOne.com to a VPS server for the first time, the system will automatically detect that no super admin exists and show a **one-time initialization screen**.

#### Bootstrap Flow:

1. **Deploy to VPS** - Set up the application on your server
2. **Access Login Page** - Visit your application URL
3. **System Auto-Detection** - The system checks if a super admin exists
4. **Initialization Screen** - If no super admin exists, you'll see "Initialize AkashOne.com Platform"
5. **Create Super Admin** - Fill in the form:
   - Username (e.g., `admin`)
   - Email (e.g., `admin@yourcompany.com`)
   - Password (strong password recommended)
   - GST Number (15-character Indian GST format)
6. **Submit** - The system creates the first super admin account
7. **Login** - Use the credentials you just created to log in

> **Note:** The bootstrap initialization is a **one-time process**. Once a super admin account exists, this screen will never appear again. Regular users cannot register themselves.

---

## Hierarchical User Creation Flow

After the super admin is created, all other users are created through the admin interface:

### User Hierarchy:
```
Super Admin (Platform Owner)
    ↓
Resellers (White-label Partners)
    ↓
Customers (End Users)
    ↓
Team Members (Customer's Team)
```

---

## Creating Users in Production

### 1. Super Admin Creates Resellers

**Super Admin Actions:**
1. Log in to the platform
2. Navigate to **Admin** → **Resellers**
3. Click **Add Reseller**
4. Fill in reseller details:
   - Username
   - Email
   - Password
   - GST Number
   - Company Name
   - White-label settings (optional)
5. Submit

**Result:** Reseller account is created with `accountType: "reseller"`

---

### 2. Resellers Create Customers

**Reseller Actions:**
1. Log in to the platform (as reseller)
2. Navigate to **Customers** → **My Customers**
3. Click **Add Customer**
4. Fill in customer details:
   - Username
   - Email
   - Password
   - GST Number
   - Company Name
   - Service Plans (assign available plans)
   - Discounts (if applicable)
5. Submit

**Result:** Customer account is created with `accountType: "customer"` and `organizationId` linked to the reseller

---

### 3. Customers Create Team Members

**Customer Actions:**
1. Log in to the platform (as customer)
2. Navigate to **Account** → **Team Members**
3. Click **Invite Team Member**
4. Fill in team member details:
   - Email (invitation sent)
   - Role (assign from available roles)
   - Permissions (granular access control)
5. Submit

**Result:** Team member account is created with `accountType: "team_member"` and specific permissions

---

## Account Types & Permissions

### Super Admin (`super_admin`)
- **Full platform access**
- Manage all infrastructure, billing, administration
- Create/manage resellers
- Access to all system settings

### Reseller (`reseller`)
- **Customer management**
- White-label branding
- Service plan configuration
- Customer billing management
- Cannot access other resellers' customers

### Customer (`customer`)
- **Own infrastructure management**
- VMs, Kubernetes, Database, Storage
- Networking (VPC, DNS, Firewall, Load Balancers)
- Security (SSL, SSH, DDoS)
- Billing and team management
- Cannot access other customers' resources

### Team Member (`team_member`)
- **Permission-based access**
- Only sees features with assigned permissions
- Cannot create other team members (by default)
- Granular access control (compute, networking, billing, etc.)

---

## Production Security Checklist

### Before Going Live:

- [ ] Create super admin account via bootstrap
- [ ] Set strong passwords for all accounts
- [ ] Enable 2FA for super admin
- [ ] Configure environment variables:
  - `SESSION_SECRET` - Strong random string
  - `DATABASE_URL` - Production database
  - `CLOUDSTACK_API_URL` - Your CloudStack API endpoint
  - `CLOUDSTACK_API_KEY` - CloudStack API key
  - `CLOUDSTACK_SECRET_KEY` - CloudStack secret key
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Test user creation flow
- [ ] Verify role-based access control

---

## Test Accounts (Development Only)

For development/testing, the following accounts have been pre-created:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Super Admin | `admin` | `admin123` | admin@akashone.com |
| Reseller | `reseller1` | `reseller123` | reseller@akashone.com |
| Customer | `customer1` | `customer123` | customer@akashone.com |
| Team Member | `teammember1` | `team123` | team@akashone.com |

> **⚠️ IMPORTANT:** Delete these test accounts before production deployment!

---

## API Endpoints for User Management

### Bootstrap Check
```bash
GET /api/auth/bootstrap-status
Response: { "needsBootstrap": true/false, "hasSuperAdmin": true/false }
```

### Create Super Admin (Bootstrap)
```bash
POST /api/auth/register
Body: {
  "username": "admin",
  "email": "admin@company.com",
  "password": "secure_password",
  "gstNumber": "29ABCDE1234F1Z5",
  "isBootstrap": true
}
```

### Create Reseller (Super Admin)
```bash
POST /api/resellers
Headers: { "Cookie": "session=..." }
Body: {
  "username": "reseller_username",
  "email": "reseller@company.com",
  "password": "secure_password",
  "gstNumber": "27FGHIJ5678K2L1",
  "companyName": "Reseller Corp"
}
```

### Create Customer (Reseller)
```bash
POST /api/customers
Headers: { "Cookie": "session=..." }
Body: {
  "username": "customer_username",
  "email": "customer@company.com",
  "password": "secure_password",
  "gstNumber": "19MNOPQ9012R3S4",
  "companyName": "Customer LLC"
}
```

### Create Team Member (Customer)
```bash
POST /api/iam/team-members
Headers: { "Cookie": "session=..." }
Body: {
  "email": "team@company.com",
  "roleId": "role-uuid"
}
```

---

## Common Issues & Solutions

### Issue: Bootstrap screen doesn't appear
**Solution:** Ensure database has no users with `accountType: "super_admin"`. Check `/api/auth/bootstrap-status`.

### Issue: Cannot create reseller/customer
**Solution:** Verify you're logged in with correct role. Super admin creates resellers, resellers create customers.

### Issue: Team member has no access
**Solution:** Check role permissions. Assign appropriate permissions via IAM → Roles.

### Issue: User creation fails with "GST validation error"
**Solution:** Ensure GST number follows format: `00AAAAA0000A0Z0` (15 characters, specific pattern).

### Issue: Getting "Self-registration is disabled" error
**Solution:** This is correct behavior! After bootstrap, public registration is disabled. Users must be created by administrators through the admin panel.

---

## Environment Variables Reference

### Required for Production:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Session Security
SESSION_SECRET=generate-a-strong-random-string

# CloudStack Integration
CLOUDSTACK_API_URL=https://your-cloudstack-api.com
CLOUDSTACK_API_KEY=your-api-key
CLOUDSTACK_SECRET_KEY=your-secret-key

# Node Environment
NODE_ENV=production
```

---

## Support & Troubleshooting

For production deployment assistance:
1. Check application logs for errors
2. Verify database connection
3. Ensure all environment variables are set
4. Test API endpoints with curl/Postman
5. Contact support@akashone.com for platform-specific issues

---

## License & Copyright

© 2025 Mieux Technologies Pvt Ltd. All rights reserved.
