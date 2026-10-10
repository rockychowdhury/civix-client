Implementation Completed: Municipality Overview Endpoint
The Municipality Dashboard Overview telemetry endpoint has been created and verified:

Endpoint: GET /api/v1/municipalities/:municipalityId/overview
Controller: 

MunicipalityController.getMunicipalityOverview
Service: 

MunicipalityService.getMunicipalityOverview
Route: 

MunicipalityRoutes
Query Parameters:
timeRange: "today" | "this_week" | "this_month" | "this_year" | "all_time"
startDate: ISO 8601 string (e.g., "2026-10-01T00:00:00.000Z")
endDate: ISO 8601 string (e.g., "2026-10-10T23:59:59.999Z")
Response Payload Structure:
json
{
  "success": true,
  "message": "Municipality overview telemetry retrieved successfully",
  "data": {
    "municipality": {
      "id": "uuid",
      "name": "Dhaka North City Corporation",
      "code": "DNCC",
      "countryCode": "BGD",
      "timezone": "Asia/Dhaka",
      "coverageStatus": "ACTIVE",
      "counts": {
        "totalDepartments": 8,
        "totalZones": 10,
        "totalWards": 54,
        "totalStaff": 120,
        "totalSlaPolicies": 6
      }
    },
    "timeRange": {
      "filter": "this_week",
      "startDate": "2026-10-03T00:00:00.000Z",
      "endDate": "2026-10-10T20:00:00.000Z"
    },
    "issueStats": {
      "total": 1250,
      "periodTotal": 85,
      "openTotal": 42,
      "unassignedQueue": 14,
      "escalatedCount": 3,
      "overdueCount": 5,
      "resolvedTotal": 1150,
      "closedTotal": 58,
      "resolutionRate": 96.6,
      "byStatus": { "IN_PROGRESS": 25, "RESOLVED": 1150, "SUBMITTED": 14 },
      "byPriority": [
        { "id": "p-1", "code": "CRITICAL", "name": "Critical", "weight": 50, "colorCode": "#EF4444", "count": 8 }
      ]
    },
    "serviceRequestStats": {
      "total": 1800,
      "periodTotal": 110,
      "queueCount": 18,
      "inProgressCount": 32,
      "resolvedCount": 1750,
      "byStatus": { "SUBMITTED": 12, "ASSIGNED": 15, "RESOLVED": 1750 }
    },
    "workOrderStats": {
      "total": 920,
      "periodTotal": 64,
      "needCrew": 8,
      "assigned": 12,
      "inProgress": 22,
      "pendingVerification": 7,
      "resolved": 850,
      "closed": 21,
      "activeTotal": 49,
      "overdueCount": 2
    },
    "staffStats": {
      "totalStaff": 120,
      "byRole": { "DEPARTMENT_MANAGER": 8, "DISPATCHER": 16, "TECHNICIAN": 96 },
      "technicians": { "total": 96, "available": 72, "busy": 24 }
    },
    "departmentPerformance": [
      {
        "id": "dept-1",
        "name": "Waste Management",
        "code": "WM",
        "staffCount": 35,
        "activeWorkOrders": 14,
        "openIssues": 12,
        "resolvedIssues": 430,
        "escalatedIssues": 0
      }
    ],
    "wardHotspots": [
      {
        "id": "ward-12",
        "wardNumber": "12",
        "name": "Mirpur-1",
        "zoneName": "Zone 4",
        "openIssuesCount": 9,
        "totalIssuesCount": 9
      }
    ],
    "citizenSatisfaction": {
      "averageRating": 4.65,
      "totalFeedbacks": 320,
      "ratingDistribution": { "1": 5, "2": 8, "3": 25, "4": 110, "5": 172 }
    },
    "quickQueues": {
      "criticalEscalatedIssues": [],
      "overdueWorkOrders": [],
      "recentIssues": []
    }
  }
}
2. Full City Admin API Endpoints Reference
Below is the comprehensive list of endpoints accessible by the City Admin for implementation in the City Dashboard client.

1. Municipality & Geospatial Management
1.1 Get Municipality Profile
Method & URL: GET /api/v1/municipalities/:municipalityId
Query Params: None
1.2 Update Municipality Settings
Method & URL: PATCH /api/v1/municipalities/:municipalityId
Payload:
json
{
  "name": "Dhaka North City Corporation",
  "countryCode": "BGD",
  "timezone": "Asia/Dhaka",
  "coverageStatus": "ACTIVE" // "ACTIVE" | "INACTIVE"
}
1.3 List Zones in Municipality
Method & URL: GET /api/v1/zones
Query Params: municipalityId, searchTerm, page, limit, sortBy, sortOrder
1.4 Create Zone
Method & URL: POST /api/v1/zones
Payload:
json
{
  "municipalityId": "uuid",
  "name": "Zone 04 (Mirpur)",
  "code": "ZONE-04"
}
1.5 List Wards in Municipality/Zone
Method & URL: GET /api/v1/wards
Query Params: zoneId, searchTerm, page, limit, sortBy, sortOrder
1.6 Create Ward
Method & URL: POST /api/v1/wards
Payload:
json
{
  "zoneId": "uuid",
  "name": "Ward 12",
  "number": "12",
  "coverageStatus": "ACTIVE"
}
2. Department Management
2.1 List All Departments in Municipality
Method & URL: GET /api/v1/departments
Query Params: municipalityId (e.g. ?municipalityId=uuid)
2.2 Create Department
Method & URL: POST /api/v1/departments
Payload:
json
{
  "municipalityId": "uuid",
  "name": "Waste Management & Sanitation",
  "code": "WM-SAN",
  "description": "Responsible for municipal solid waste collection and road cleaning.",
  "email": "sanitation@dncc.gov.bd",
  "phone": "+8801700000000"
}
2.3 Get Department Details & Configured Areas
Method & URL: GET /api/v1/departments/:id
Query Params: None
2.4 Update Department
Method & URL: PATCH /api/v1/departments/:id
Payload:
json
{
  "name": "Waste Management & Sanitation",
  "description": "Updated description",
  "email": "sanitation@dncc.gov.bd",
  "phone": "+8801700000000",
  "status": "ACTIVE" // "ACTIVE" | "INACTIVE"
}
2.5 Link Service Area (Ward) to Department
Method & URL: POST /api/v1/departments/:id/service-areas
Payload:
json
{
  "wardId": "uuid"
}
2.6 Remove Service Area (Ward) from Department
Method & URL: DELETE /api/v1/departments/:id/service-areas/:areaId
3. Staff & Hierarchy Management
3.1 List All City Staff
Method & URL: GET /api/v1/staff
Query Params:
departmentId: Filter by department
role: Filter by role code (e.g. "DEPARTMENT_MANAGER", "DISPATCHER", "TECHNICIAN")
status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
page, limit, searchTerm
3.2 Create Department Manager
Method & URL: POST /api/v1/staff/department-manager
Payload:
json
{
  "email": "manager.road@dncc.gov.bd",
  "password": "SecurePassword123!",
  "firstName": "Karim",
  "lastName": "Chowdhury",
  "employeeId": "EMP-ROAD-001",
  "departmentId": "uuid",
  "designation": "Chief Executive Engineer",
  "phone": "+8801711111111"
}
3.3 Create Dispatcher
Method & URL: POST /api/v1/staff/dispatcher
Payload:
json
{
  "email": "dispatcher.wm@dncc.gov.bd",
  "password": "SecurePassword123!",
  "firstName": "Salma",
  "lastName": "Khatun",
  "employeeId": "EMP-DISP-004",
  "departmentId": "uuid",
  "designation": "Central Dispatch Officer",
  "phone": "+8801722222222"
}
3.4 Create Technician
Method & URL: POST /api/v1/staff/technician
Payload:
json
{
  "email": "tech.electric@dncc.gov.bd",
  "password": "SecurePassword123!",
  "firstName": "Rafiqul",
  "lastName": "Islam",
  "employeeId": "EMP-TECH-108",
  "departmentId": "uuid",
  "designation": "Senior Lineman",
  "phone": "+8801733333333",
  "maxWorkload": 5
}
3.5 Update Staff Profile & Workload Limits
Method & URL: PATCH /api/v1/staff/:id
Payload:
json
{
  "firstName": "Rafiqul",
  "lastName": "Islam",
  "designation": "Lead Technician",
  "maxWorkload": 8,
  "isAvailable": true
}
3.6 Update Staff Active/Suspension Status
Method & URL: PATCH /api/v1/staff/:id/status
Payload:
json
{
  "status": "ACTIVE" // "ACTIVE" | "INACTIVE" | "SUSPENDED"
}
4. Team Operations Management
4.1 List Teams
Method & URL: GET /api/v1/teams
Query Params: departmentId, status, searchTerm, page, limit
4.2 Create Team
Method & URL: POST /api/v1/teams
Payload:
json
{
  "departmentId": "uuid",
  "name": "Rapid Pothole Repair Unit 2",
  "code": "RPR-02",
  "leaderId": "staff-user-id", // optional
  "memberIds": ["staff-user-id-1", "staff-user-id-2"] // optional
}
4.3 Update Team
Method & URL: PATCH /api/v1/teams/:id
Payload:
json
{
  "name": "Rapid Pothole Repair Unit 2",
  "leaderId": "staff-user-id",
  "status": "ACTIVE" // "ACTIVE" | "INACTIVE"
}
5. Civic Issues Management
5.1 List Municipality Civic Issues
Method & URL: GET /api/v1/civic-issues/municipality/:municipalityId
Query Params:
departmentId: Filter by department
wardId: Filter by ward
categoryId: Filter by service category
status: SUBMITTED | TRIAGED | ASSIGNED | IN_PROGRESS | PENDING_VERIFICATION | RESOLVED | CLOSED | CANCELLED
priorityId: Filter by priority ID
searchTerm, page, limit, sortBy, sortOrder
5.2 Get Issue Full Details
Method & URL: GET /api/v1/civic-issues/:id
Includes: Location, ward, reporters, photos, linked service requests, work orders, escalation logs, timeline.
5.3 Update Issue Status
Method & URL: PATCH /api/v1/civic-issues/:id/status
Payload:
json
{
  "status": "TRIAGED", // LifecycleStatus enum
  "comment": "Triaged by City Admin, assigned to Roads Department"
}
5.4 Reopen Closed/Resolved Issue
Method & URL: POST /api/v1/civic-issues/:id/reopen
Payload:
json
{
  "reason": "Citizen reported water leakage recurred 24 hours after repair"
}
6. Service Requests Management
6.1 List Municipality Service Requests
Method & URL: GET /api/v1/service-requests/municipality/:municipalityId
Query Params:
status: SUBMITTED | TRIAGED | ASSIGNED | IN_PROGRESS | PENDING_VERIFICATION | RESOLVED | CLOSED
categoryId: Filter by category
page, limit, searchTerm
6.2 Get Service Request Details
Method & URL: GET /api/v1/service-requests/:id
7. Work Orders Management
7.1 List Municipality Work Orders
Method & URL: GET /api/v1/work-orders/municipality/:municipalityId
Query Params:
departmentId: Filter by department
status: WORK_ORDER_CREATED | ASSIGNED | IN_PROGRESS | PAUSED | PENDING_VERIFICATION | RESOLVED | CLOSED
priority: LOW | MEDIUM | HIGH | URGENT | CRITICAL
page, limit, searchTerm, sortBy, sortOrder
7.2 Create Work Order
Method & URL: POST /api/v1/work-orders
Payload:
json
{
  "civicIssueId": "uuid",
  "departmentId": "uuid",
  "title": "Repair Broken Water Main on 12/A",
  "description": "Excavate surface, weld pipe rupture, resurface asphalt.",
  "scheduledAt": "2026-10-12T08:00:00.000Z" // optional
}
7.3 Assign Team or Technician to Work Order
Method & URL: POST /api/v1/assignments
Payload:
json
{
  "workOrderId": "uuid",
  "assignmentType": "TEAM", // "TEAM" | "INDIVIDUAL"
  "teamId": "uuid", // if TEAM
  "staffId": "uuid", // if INDIVIDUAL
  "notes": "Emergency response crew deployed"
}
7.4 Update Work Order Status
Method & URL: PATCH /api/v1/work-orders/:id/status
Payload:
json
{
  "status": "IN_PROGRESS",
  "notes": "Work on site has commenced"
}
8. Quality Verification & Citizen Feedback
8.1 Verify Work Order Resolution
Method & URL: POST /api/v1/resolutions/:id/verify
Payload:
json
{
  "status": "VERIFIED", // "VERIFIED" | "REJECTED"
  "notes": "Field inspection confirmed water line is fully sealed and road repaved."
}
8.2 Get Feedback across Municipality
Method & URL: GET /api/v1/feedback/municipality/:municipalityId
Query Params: page, limit, sortBy, sortOrder
9. Service Policies & Categories
9.1 List Service Categories
Method & URL: GET /api/v1/categories
Query Params: isActive=true
9.2 Create / Update Service Category
Method & URL: POST /api/v1/categories | PATCH /api/v1/categories/:categoryId
Payload:
json
{
  "name": "Street Light Defect",
  "code": "STREET_LIGHT",
  "description": "Malfunctioning or flickering street lights",
  "departmentId": "uuid",
  "parentId": "parent-category-id" // optional
}
9.3 List Municipality SLA Policies
Method & URL: GET /api/v1/sla-policies
Query Params: municipalityId
9.4 Create SLA Policy
Method & URL: POST /api/v1/sla-policies
Payload:
json
{
  "municipalityId": "uuid",
  "priorityLevelId": "uuid",
  "responseDeadlineHours": 4,
  "resolutionDeadlineHours": 24,
  "escalationThresholdHours": 18
}
