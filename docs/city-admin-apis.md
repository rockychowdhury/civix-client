Here is the list of API endpoints available for the **City Admin (`CITY_ADMIN`)** to manage municipality-wide operations, grouped by resource tabs for the **City Admin Dashboard**:

---

### Tab 1: 🏛️ City Overview & Municipality Profile
*Manage municipality info, general status, and view city-wide configuration.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/municipalities/:municipalityId` | Public / Auth | View the city's profile, contact details, active coverage, and status |
| `GET` | `/api/v1/municipalities` | Public / Auth | Reference city metadata |

---

### Tab 2: 🏢 Departments & Teams (Operations & Service Routing)
*City Admins have `MANAGE: DEPARTMENT` permission to create departments, assign service areas, and manage teams.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/departments` | `requireAuth` | List all departments in the municipality |
| `POST` | `/api/v1/departments` | `requireAuth` | Create a new municipal department (e.g., Waste, Roads, Electricity) |
| `GET` | `/api/v1/departments/:id` | `requireAuth` | View department details and its associated staff/teams |
| `PATCH` | `/api/v1/departments/:id` | `requireAuth` | Update department details (name, code, head, contact) |
| `POST` | `/api/v1/departments/:id/service-areas` | `requireAuth` | Assign a ward/service area to this department |
| `DELETE` | `/api/v1/departments/:id/service-areas/:areaId` | `requireAuth` | Remove ward/service area coverage from the department |
| `GET` | `/api/v1/teams` | `requireAuth` | List all operational teams within municipal departments |
| `POST` | `/api/v1/teams` | `requireAuth` | Create a new specialized crew/team |
| `PATCH` | `/api/v1/teams/:id` | `requireAuth` | Update team details or team leader |
| `DELETE` | `/api/v1/teams/:id` | `requireAuth` | Disband or remove a team |

---

### Tab 3: 👔 Staff Management (Municipal Workforce)
*City Admins have `MANAGE: STAFF` to hire and configure personnel across all departments in their city.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/staff` | `requireAuth` | List all staff members scoped to this municipality |
| `GET` | `/api/v1/staff/technicians` | `requireAuth` | Filter list of all active field technicians in the city |
| `GET` | `/api/v1/staff/:id` | `requireAuth` | View detailed staff member profile, workload, and assignments |
| `POST` | `/api/v1/staff/department-manager` | `requireAuth` *(City Admin scope)* | Provision and onboard a **Department Manager** |
| `POST` | `/api/v1/staff/dispatcher` | `requireAuth` *(City Admin scope)* | Provision and onboard a **Dispatcher** |
| `POST` | `/api/v1/staff/technician` | `requireAuth` *(City Admin scope)* | Provision and onboard a **Field Technician** |
| `PATCH` | `/api/v1/staff/:id` | `requireAuth` | Update staff details, designation, contact, or department |
| `PATCH` | `/api/v1/staff/:id/status` | `requireAuth` | Toggle staff member active/inactive status |

---

### Tab 4: 🗺️ Jurisdiction & Geography (Zones & Wards)
*City Admins have `MANAGE: ZONE` and `MANAGE: WARD` to define municipal administrative boundaries.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/zones` | Public / Auth | List all geographic zones in the city |
| `POST` | `/api/v1/zones` | `CREATE: ZONE` | Create a new zone |
| `GET` | `/api/v1/zones/:zoneId` | Public / Auth | View zone details |
| `PATCH` | `/api/v1/zones/:zoneId` | `UPDATE: ZONE` | Update zone boundary or naming |
| `DELETE` | `/api/v1/zones/:zoneId` | `DELETE: ZONE` | Remove a zone |
| `GET` | `/api/v1/zones/:zoneId/wards` | Public / Auth | View all wards belonging to a zone |
| `GET` | `/api/v1/wards` | Public / Auth | List all wards within the municipality |
| `POST` | `/api/v1/wards` | `CREATE: WARD` | Create a new ward |
| `GET` | `/api/v1/wards/:wardId` | Public / Auth | View ward details |
| `PATCH` | `/api/v1/wards/:wardId` | `UPDATE: WARD` | Edit ward details (ward number, counselor, boundaries) |
| `DELETE` | `/api/v1/wards/:wardId` | `DELETE: WARD` | Remove a ward |
| `GET` | `/api/v1/wards/:wardId/departments` | Public / Auth | View which departments have jurisdiction over this ward |

---

### Tab 5: 🚨 Incident Management (Civic Issues & Service Requests)
*City Admins have full lifecycle authority over civic issues and citizen requests in their city (`CREATE`, `READ`, `UPDATE`, `DELETE`, `CLOSE`, `REOPEN`, `MERGE`).*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/civic-issues/municipality/:municipalityId` | `READ: CIVIC_ISSUE` | List all consolidated issues across the entire municipality |
| `GET` | `/api/v1/civic-issues/:id` | `READ: CIVIC_ISSUE` | View complete issue timeline, location, work orders, and photos |
| `PATCH` | `/api/v1/civic-issues/:id/status` | `UPDATE: CIVIC_ISSUE` | Override or update issue status (e.g. mark closed or duplicate) |
| `POST` | `/api/v1/civic-issues/:id/reopen` | `REOPEN: CIVIC_ISSUE` | Reopen an issue if work was deemed unsatisfactory |
| `GET` | `/api/v1/service-requests/municipality/:municipalityId` | `MANAGE: SERVICE_REQUEST` | View all citizen-submitted requests in this municipality |
| `GET` | `/api/v1/service-requests/:id` | `READ: SERVICE_REQUEST` | View single service request details and tracking history |
| `GET` | `/api/v1/service-requests/civic-issue/:civicIssueId` | `READ: SERVICE_REQUEST` | View merged/clustered citizen requests under an issue |

---

### Tab 6: 🏷️ Service Catalog & SLAs (Categories & Policies)
*City Admins have `MANAGE: CATEGORY` and `MANAGE: SLA_POLICY` to configure service types and resolution targets.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Public / Auth | View full hierarchy of civic issue categories |
| `POST` | `/api/v1/categories` | `MANAGE: CATEGORY` | Create a new issue category or subcategory |
| `GET` | `/api/v1/categories/:categoryId` | `READ: CATEGORY` | View category details |
| `PATCH` | `/api/v1/categories/:categoryId` | `MANAGE: CATEGORY` | Edit category icon, name, department assignment, or SLA |
| `DELETE` | `/api/v1/categories/:categoryId` | `MANAGE: CATEGORY` | Archive/delete an issue category |
| `GET` | `/api/v1/categories/:categoryId/children` | `READ: CATEGORY` | View child subcategories |
| `GET` | `/api/v1/sla-policies` | `requireAuth` | List all SLA response and resolution time policies |
| `POST` | `/api/v1/sla-policies` | `requireAuth` | Create an SLA policy with target hours/deadlines |
| `PATCH` | `/api/v1/sla-policies/:id` | `requireAuth` | Adjust response or resolution time targets |
| `DELETE` | `/api/v1/sla-policies/:id` | `requireAuth` | Delete an SLA policy |

---

### Tab 7: ⭐ Citizen Feedback & Quality Monitoring
*Monitor citizen satisfaction and service ratings across the city.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/feedback/municipality/:municipalityId` | `READ: FEEDBACK` | View all citizen reviews, ratings, and feedback for the city |
| `GET` | `/api/v1/feedback/department/:departmentId` | `READ: FEEDBACK` | Filter feedback by individual department |
| `GET` | `/api/v1/feedback/:id` | `READ: FEEDBACK` | View feedback details attached to a completed request |

---

### Tab 8: 🔔 Notifications & Profile
*Personal and administrative account management.*

| Method | Endpoint | Required Auth / Permission | Description / UI Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | `requireAuth` | Get logged-in City Admin profile & municipality metadata |
| `PATCH` | `/api/v1/users/me` | `UPDATE: PROFILE` | Update own contact info and profile details |
| `GET` | `/api/v1/notifications` | `READ: NOTIFICATION` | View city alerts, escalations, and system notifications |