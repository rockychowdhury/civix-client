export interface StatusHistoryEntry {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  notes: string | null;
  createdAt: string;
  changedById?: string | null;
  changedBy?: {
    email?: string;
    displayName?: string;
  } | null;
}

export interface CivicIssue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  status: string;
  priority?:
    | {
        id?: string;
        code?: string;
        name?: string;
        weight?: number;
        colorCode?: string | null;
      }
    | string;
  priorityId?: string;
  priorityOverriddenBy?: string;
  priorityOverrideReason?: string;
  slaDeadline?: string;
  reportedCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  createdAt: string;
  updatedAt: string;
  responseDeadlineAt?: string | null;
  resolutionDeadlineAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  hasWorkOrder?: boolean;
  departmentId?: string;
  department?: { id: string; name: string; code?: string; description?: string | null };
  wardId?: string;
  ward?: string | { id?: string; name?: string; number?: string; zoneId?: string };
  location: {
    address: string;
    landmark?: string | null;
    postalCode?: string | null;
    latitude: number | null;
    longitude: number | null;
    ward?: string;
    zone?: string;
  };
  category: {
    id?: string;
    name: string;
    slug?: string;
    description: string | null;
    baseSeverity?: number;
  };
  municipality?: {
    name?: string;
    code?: string;
  };
  serviceRequests?: any[];
  workOrders?: Array<{
    id: string;
    title?: string;
    status?: string;
    currentAssigneeId?: string | null;
    currentAssignee?: {
      id?: string;
      employeeId?: string;
      name?: string;
      user?: {
        id?: string;
        email?: string;
        name?: string;
      };
    } | null;
    createdAt?: string;
  }>;
  escalations?: Array<{
    id?: string;
    escalationLevel?: string | number;
    reason?: string;
    escalatedAt?: string;
    resolvedAt?: string | null;
  }>;
  _count?: {
    serviceRequests?: number;
    workOrders?: number;
    escalations?: number;
  };
  statusHistory: StatusHistoryEntry[];
}

export interface ICreateWorkOrderPayload {
  civicIssueId: string;
  title?: string;
  description?: string;
  scheduledAt?: string;
}
