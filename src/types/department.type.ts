export interface IDepartmentLeadershipManager {
  userId: string;
  employeeId: string;
  name: string;
  designation: string;
  email: string | null;
  phone: string | null;
}

export interface IDepartmentOverviewDepartment {
  id: string;
  name: string;
  code: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  municipality: {
    id: string;
    name: string;
    code: string;
  };
  leadership: {
    heads: any[];
    managers: IDepartmentLeadershipManager[];
  };
  counts: {
    totalMembers: number;
    totalTeams: number;
    totalServiceAreas: number;
    totalCategories: number;
  };
}

export interface IDepartmentWorkOrderStats {
  total: number;
  periodTotal: number;
  needCrew: number;
  assigned: number;
  inProgress: number;
  pendingVerification: number;
  resolved: number;
  closed: number;
  activeTotal: number;
  overdueCount: number;
}

export interface IDepartmentIssueQueueStats {
  total: number;
  openTotal: number;
  periodTotal: number;
  overdueCount: number;
  byStatus: Record<string, number>;
  byPriority: Array<{
    id: string;
    code: string;
    name: string;
    weight: number;
    colorCode: string | null;
    count: number;
  }>;
}

export interface ITechnicianRosterItem {
  userId: string;
  employeeId: string;
  name: string;
  designation: string;
  email: string;
  phone: string | null;
  isAvailable: boolean;
  currentWorkload: number;
  maxWorkload: number;
  utilization: number;
}

export interface IDepartmentStaffStats {
  totalStaff: number;
  technicians: {
    total: number;
    available: number;
    busy: number;
    totalCurrentWorkload: number;
    totalCapacity: number;
    utilizationRate: number;
  };
  dispatchersCount: number;
  technicianRoster: ITechnicianRosterItem[];
}

export interface IDepartmentResolutionStats {
  total: number;
  periodTotal: number;
  pendingVerification: number;
  verified: number;
  rejected: number;
  approvalRate: number;
}

export interface IDepartmentOverviewQueues {
  unassignedWorkOrders: any[];
  activeWorkOrders: any[];
  pendingVerificationWorkOrders: any[];
  recentWorkUpdates: any[];
}

export interface IDepartmentOverviewData {
  department: IDepartmentOverviewDepartment;
  timeRange: {
    filter: string;
    startDate: string | null;
    endDate: string | null;
  };
  workOrderStats: IDepartmentWorkOrderStats;
  issueQueueStats: IDepartmentIssueQueueStats;
  staffStats: IDepartmentStaffStats;
  resolutionStats: IDepartmentResolutionStats;
  queues: IDepartmentOverviewQueues;
}
