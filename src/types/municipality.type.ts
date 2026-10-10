export type CoverageStatus = "ACTIVE" | "INACTIVE" | "PLANNED";

export interface AdminMunicipality {
  id: string;
  name: string;
  code: string;
  countryCode?: string;
  timezone?: string;
  coverageStatus: CoverageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMunicipalityPayload {
  name: string;
  code: string;
  countryCode?: string;
  timezone?: string;
  coverageStatus?: CoverageStatus;
}

export interface UpdateMunicipalityPayload {
  name?: string;
  code?: string;
  countryCode?: string;
  timezone?: string;
  coverageStatus?: CoverageStatus;
}

export interface MunicipalityFilter {
  searchTerm?: string;
  coverageStatus?: CoverageStatus;
  page?: number;
  limit?: number;
}

export interface MunicipalityOverviewData {
  municipality: {
    id: string;
    name: string;
    code: string;
    countryCode?: string | null;
    timezone?: string | null;
    coverageStatus: string;
    counts: {
      totalDepartments: number;
      totalZones: number;
      totalWards: number;
      totalStaff: number;
      totalSlaPolicies: number;
    };
  };
  timeRange: { filter: string; startDate: string | null; endDate: string | null };
  issueStats: {
    total: number;
    periodTotal: number;
    openTotal: number;
    unassignedQueue: number;
    escalatedCount: number;
    overdueCount: number;
    resolvedTotal: number;
    closedTotal: number;
    resolutionRate: number;
    byStatus: Record<string, number>;
    byPriority: { id: string; code: string; name: string; count: number; percentage: number }[];
  };
  serviceRequestStats: {
    total: number;
    periodTotal: number;
    queueCount: number;
    inProgressCount: number;
    resolvedCount: number;
    byStatus: Record<string, number>;
  };
  workOrderStats: {
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
  };
  staffStats: {
    totalStaff: number;
    byRole: Record<string, number>;
    technicians: { total: number; available: number; busy: number };
  };
  departmentPerformance: { id: string; name: string; openIssues: number; resolvedIssues: number }[];
  wardHotspots: { id: string; name: string; number?: string; issueCount: number }[];
  citizenSatisfaction: {
    averageRating: number;
    totalFeedbacks: number;
    ratingDistribution: Record<string, number>;
  };
  quickQueues: {
    criticalEscalatedIssues: unknown[];
    overdueWorkOrders: unknown[];
    recentIssues: unknown[];
  };
}
