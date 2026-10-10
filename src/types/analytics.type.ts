export interface PlatformDashboardStats {
  totalIssues: number;
  resolvedIssues: number;
  openIssues: number;
  breachedIssues: number;
  resolutionRate: number;
}
export interface IssuesByDepartment {
  id: string;
  name: string;
  issueCount: number;
}

export interface IssuesByWard {
  id: string;
  name: string;
  number: number;
  issueCount: number;
}

export type SuperAdminTimeRange = "today" | "this_week" | "this_month" | "this_year" | "all_time";

export interface SuperAdminKpis {
  totalMunicipalities: number;
  activeMunicipalities: number;
  totalUsers: number;
  activeUsers: number;
  totalCitizens: number;
  totalStaff: number;
  totalDepartments: number;
  totalWards: number;
  totalCivicIssues: number;
  periodCivicIssues: number;
  resolvedCivicIssues: number;
  closedCivicIssues: number;
  openCivicIssues: number;
  breachedCivicIssues: number;
  systemResolutionRate: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  averageCitizenRating: number;
  totalFeedbacks: number;
}

export interface SuperAdminIssueBreakdown {
  total: number;
  periodTotal: number;
  openTotal: number;
  resolvedTotal: number;
  closedTotal: number;
  unassignedTotal: number;
  escalatedTotal: number;
  overdueTotal: number;
  resolutionRate: number;
  byStatus: Record<string, number>;
  byPriority: {
    id: string;
    code: string;
    name: string;
    weight: number;
    colorCode: string | null;
    count: number;
    percentage: number;
  }[];
}

export interface SuperAdminUserBreakdown {
  total: number;
  periodNewUsers: number;
  byStatus: Record<string, number>;
  byRole: { roleCode: string; roleName: string; count: number }[];
  citizens: { total: number; byTrustLevel: Record<string, number> };
  staff: { total: number; availableTechnicians: number; busyTechnicians: number };
}

export interface SuperAdminWorkOrderBreakdown {
  total: number;
  periodTotal: number;
  activeTotal: number;
  completedTotal: number;
  overdueTotal: number;
  byStatus: Record<string, number>;
}

export interface SuperAdminOverviewMunicipality {
  id: string;
  name: string;
  code: string;
  coverageStatus: string;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
  departmentsCount: number;
  staffCount: number;
  serviceRequestsCount: number;
}

export interface SuperAdminOverviewCategory {
  id: string;
  name: string;
  slug: string;
  departmentName: string;
  issueCount: number;
  percentage: number;
}

export interface SuperAdminTrendPoint {
  date: string;
  label: string;
  issuesCreated: number;
  issuesResolved: number;
  newUsers: number;
  workOrdersCreated: number;
}

export interface SuperAdminCriticalIssue {
  id: string;
  issueNumber: string;
  title: string;
  status: string;
  createdAt: string;
  responseDeadlineAt: string | null;
  resolutionDeadlineAt: string | null;
  reportedCount: number;
  priority: { id: string; code: string; name: string; colorCode: string | null; weight: number };
  municipality: { id: string; name: string; code: string };
  department: { id: string; name: string; code: string };
  ward: { id: string; name: string; number: string };
}

export interface SuperAdminAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  createdAt: string;
  ipAddress: string | null;
  user: { id: string; email: string; displayName: string };
}

export interface SuperAdminOverviewData {
  kpis: SuperAdminKpis;
  timeRange: { filter: string; startDate: string | null; endDate: string | null };
  civicIssues: SuperAdminIssueBreakdown;
  users: SuperAdminUserBreakdown;
  workOrders: SuperAdminWorkOrderBreakdown;
  serviceRequests: { total: number; periodTotal: number; byStatus: Record<string, number> };
  municipalities: SuperAdminOverviewMunicipality[];
  categories: SuperAdminOverviewCategory[];
  citizenSatisfaction: {
    averageRating: number;
    totalFeedbacks: number;
    satisfactionRate: number;
    ratingDistribution: Record<string, number>;
  };
  slaAndEscalations: {
    totalEscalations: number;
    periodEscalations: number;
    unacknowledgedEscalations: number;
    resolvedEscalations: number;
    activeEscalations: number;
    overdueIssuesCount: number;
  };
  trends: SuperAdminTrendPoint[];
  actionableQueues: {
    criticalIssues: SuperAdminCriticalIssue[];
    recentEscalations: unknown[];
    recentAuditLogs: SuperAdminAuditLog[];
    recentMunicipalities: {
      id: string;
      name: string;
      code: string;
      coverageStatus: string;
      createdAt: string;
      counts: { departments: number; staff: number; issues: number };
    }[];
  };
}
