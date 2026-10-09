Viewed app.ts:1-110
Searched for "PLATFORM_ADMIN"
Viewed role.constant.ts:1-10
Viewed seedRolesAndPermissions.ts:1-120
Viewed municipality.route.ts:1-34
Viewed user.route.ts:1-59
Viewed role.route.ts:1-75
Viewed permission.route.ts:1-21
Viewed department.route.ts:1-50
Viewed category.route.ts:1-59
Viewed sla-policy.route.ts:1-37
Viewed zone.route.ts:1-33
Viewed ward.route.ts:1-36
Viewed staff.route.ts:1-86
Viewed analytics.route.ts:1-28
Viewed civic-issue.route.ts:1-58
Viewed service-request.route.ts:1-48
Viewed feedback.route.ts:1-42
Viewed team.route.ts:1-33
Viewed role-routing.ts:1-800

In `civix-api`, both **`SUPER_ADMIN`** (full wildcard `MANAGE:ALL` access) and **`PLATFORM_ADMIN`** (cross-municipality platform operations and tenant management) have administrative capabilities over the entire system.

Here is the complete categorized list of endpoints to integrate into the **Admin / Super Admin Dashboard**:

---

### 1. 📊 Platform Analytics & Metrics
Implemented in [analytics.route.ts](file:///c:/Projects/civix-api/src/module/analytics/analytics.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/dashboard` | `READ: ALL` | Overview statistics, SLA compliance, issue counts |
| `GET` | `/api/v1/analytics/issues-by-department` | `READ: ALL` | Distribution of civic issues by department |
| `GET` | `/api/v1/analytics/issues-by-ward` | `READ: ALL` | Distribution of civic issues across geographical wards |

---

### 2. 🏛️ Municipality / Tenant Management
Implemented in [municipality.route.ts](file:///c:/Projects/civix-api/src/module/municipality/municipality.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/municipalities` | Public / Auth | List all municipalities |
| `POST` | `/api/v1/municipalities` | `CREATE: MUNICIPALITY` | Onboard a new municipality |
| `GET` | `/api/v1/municipalities/:municipalityId` | Public / Auth | Retrieve single municipality details |
| `PATCH` | `/api/v1/municipalities/:municipalityId` | `UPDATE: MUNICIPALITY` | Update municipality settings/information |
| `DELETE` | `/api/v1/municipalities/:municipalityId` | `DELETE: MUNICIPALITY` | Remove a municipality |

---

### 3. 👥 User Management & Moderation
Implemented in [user.route.ts](file:///c:/Projects/civix-api/src/module/user/user.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `READ: USER` | List platform users (with search, pagination, filters) |
| `GET` | `/api/v1/users/:userId` | `READ: USER` | View full user profile and role details |
| `PATCH` | `/api/v1/users/:userId/status` | `UPDATE: USER` | Suspend, activate, or deactivate a user account |
| `PATCH` | `/api/v1/users/:userId/restore` | `UPDATE: USER` | Restore a soft-deleted user |
| `DELETE` | `/api/v1/users/:userId` | `DELETE: USER` | Soft-delete a user account |

---

### 4. 👔 Staff Provisioning & Hierarchical Staff Management
Implemented in [staff.route.ts](file:///c:/Projects/civix-api/src/module/staff/staff.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/staff` | `requireAuth` | List all staff members across the system |
| `GET` | `/api/v1/staff/:id` | `requireAuth` | View staff member details |
| `POST` | `/api/v1/staff/platform-admin` | `MANAGE: ALL` *(Super Admin only)* | Create/provision another Platform Admin |
| `POST` | `/api/v1/staff/city-admin` | `MANAGE: STAFF` *(Super/Platform Admin)* | Provision a City Admin for a municipality |
| `POST` | `/api/v1/staff/department-manager` | `requireAuth` | Create a Department Manager |
| `POST` | `/api/v1/staff/dispatcher` | `requireAuth` | Create a Dispatcher |
| `POST` | `/api/v1/staff/technician` | `requireAuth` | Create a Technician |
| `PATCH` | `/api/v1/staff/:id` | `requireAuth` | Update staff details (designation, department, etc.) |
| `PATCH` | `/api/v1/staff/:id/status` | `requireAuth` | Toggle staff active/inactive status |

---

### 5. 🛡️ RBAC: Roles & Permission Configuration
Implemented in [role.route.ts](file:///c:/Projects/civix-api/src/module/role/role.route.ts) and [permission.route.ts](file:///c:/Projects/civix-api/src/module/permission/permission.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/roles` | `READ: ROLE` | List all system & custom roles |
| `POST` | `/api/v1/roles` | `CREATE: ROLE` | Create a new role |
| `GET` | `/api/v1/roles/:roleId` | `READ: ROLE` | View role details |
| `PATCH` | `/api/v1/roles/:roleId` | `UPDATE: ROLE` | Update role metadata |
| `DELETE` | `/api/v1/roles/:roleId` | `DELETE: ROLE` | Delete a role |
| `GET` | `/api/v1/roles/:roleId/permissions` | `READ: ROLE` | Get permissions assigned to a role |
| `PUT` | `/api/v1/roles/:roleId/permissions` | `UPDATE: ROLE` | Replace/assign permission matrix to a role |
| `GET` | `/api/v1/roles/users/:userId` | `READ: USER` | Get roles assigned to a user |
| `POST` | `/api/v1/roles/users/:userId` | `UPDATE: USER` | Assign a role to a user |
| `DELETE` | `/api/v1/roles/:roleId/users/:userId` | `UPDATE: USER` | Remove a role from a user |
| `GET` | `/api/v1/permissions` | `READ: PERMISSION` | List all system permissions |
| `GET` | `/api/v1/permissions/:permissionId` | `READ: PERMISSION` | View specific permission details |

---

### 6. 🏢 Departments & Teams Management
Implemented in [department.route.ts](file:///c:/Projects/civix-api/src/module/department/department.route.ts) and [team.route.ts](file:///c:/Projects/civix-api/src/module/team/team.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/departments` | `requireAuth` | List departments |
| `POST` | `/api/v1/departments` | `requireAuth` | Create a department |
| `GET` | `/api/v1/departments/:id` | `requireAuth` | View department details |
| `PATCH` | `/api/v1/departments/:id` | `requireAuth` | Update department details |
| `POST` | `/api/v1/departments/:id/service-areas` | `requireAuth` | Attach service areas / wards to department |
| `DELETE` | `/api/v1/departments/:id/service-areas/:areaId` | `requireAuth` | Remove service area mapping |
| `GET` | `/api/v1/teams` | `requireAuth` | List teams |
| `POST` | `/api/v1/teams` | `requireAuth` | Create team |
| `PATCH` | `/api/v1/teams/:id` | `requireAuth` | Update team |
| `DELETE` | `/api/v1/teams/:id` | `requireAuth` | Delete team |

---

### 7. 🗺️ Geographical Jurisdiction (Zones & Wards)
Implemented in [zone.route.ts](file:///c:/Projects/civix-api/src/module/zone/zone.route.ts) and [ward.route.ts](file:///c:/Projects/civix-api/src/module/ward/ward.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/zones` | Public / Auth | List all zones |
| `POST` | `/api/v1/zones` | `CREATE: ZONE` | Create zone |
| `GET` | `/api/v1/zones/:zoneId` | Public / Auth | Get zone by ID |
| `PATCH` | `/api/v1/zones/:zoneId` | `UPDATE: ZONE` | Update zone |
| `DELETE` | `/api/v1/zones/:zoneId` | `DELETE: ZONE` | Delete zone |
| `GET` | `/api/v1/zones/:zoneId/wards` | Public / Auth | Get wards belonging to a zone |
| `GET` | `/api/v1/wards` | Public / Auth | List all wards |
| `POST` | `/api/v1/wards` | `CREATE: WARD` | Create a new ward |
| `GET` | `/api/v1/wards/:wardId` | Public / Auth | Get ward by ID |
| `PATCH` | `/api/v1/wards/:wardId` | `UPDATE: WARD` | Update ward |
| `DELETE` | `/api/v1/wards/:wardId` | `DELETE: WARD` | Delete ward |
| `GET` | `/api/v1/wards/:wardId/departments` | Public / Auth | List departments covering the ward |

---

### 8. 🏷️ Categories & SLA Policies
Implemented in [category.route.ts](file:///c:/Projects/civix-api/src/module/category/category.route.ts) and [sla-policy.route.ts](file:///c:/Projects/civix-api/src/module/sla-policy/sla-policy.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Public / Auth | List issue categories |
| `POST` | `/api/v1/categories` | `MANAGE: CATEGORY` | Create a category (root or subcategory) |
| `GET` | `/api/v1/categories/:categoryId` | `READ: CATEGORY` | View category details |
| `PATCH` | `/api/v1/categories/:categoryId` | `MANAGE: CATEGORY` | Update category |
| `DELETE` | `/api/v1/categories/:categoryId` | `MANAGE: CATEGORY` | Delete category |
| `GET` | `/api/v1/categories/:categoryId/children` | `READ: CATEGORY` | Get child categories |
| `GET` | `/api/v1/sla-policies` | `requireAuth` | List SLA policies |
| `POST` | `/api/v1/sla-policies` | `requireAuth` | Create SLA policy (resolution & response targets) |
| `PATCH` | `/api/v1/sla-policies/:id` | `requireAuth` | Update SLA policy |
| `DELETE` | `/api/v1/sla-policies/:id` | `requireAuth` | Delete SLA policy |

---

### 9. 🔍 Platform-wide Oversight (Issues, Requests & Feedback)
Implemented in [civic-issue.route.ts](file:///c:/Projects/civix-api/src/module/civic-issues/civic-issue.route.ts), [service-request.route.ts](file:///c:/Projects/civix-api/src/module/service-requests/service-request.route.ts), and [feedback.route.ts](file:///c:/Projects/civix-api/src/module/feedback/feedback.route.ts):

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/civic-issues` | `READ_ALL: CIVIC_ISSUE` | Read all civic issues across all municipalities |
| `GET` | `/api/v1/civic-issues/:id` | `READ: CIVIC_ISSUE` | Inspect details of any civic issue |
| `PATCH` | `/api/v1/civic-issues/:id/status` | `UPDATE: CIVIC_ISSUE` | Override issue status |
| `POST` | `/api/v1/civic-issues/:id/reopen` | `REOPEN: CIVIC_ISSUE` | Reopen a closed issue |
| `GET` | `/api/v1/service-requests` | `READ_ALL: SERVICE_REQUEST` | View all citizen service requests |
| `GET` | `/api/v1/service-requests/:id` | `READ: SERVICE_REQUEST` | View service request details |
| `GET` | `/api/v1/feedback` | `READ_ALL: FEEDBACK` | View citizen satisfaction feedback across platform |