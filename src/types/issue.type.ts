export interface StatusHistoryEntry {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface CivicIssue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  status: string;
  priority?: string | { code?: string; name?: string };
  priorityOverriddenBy?: string;
  priorityOverrideReason?: string;
  slaDeadline?: string;
  reportedCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  createdAt: string;
  updatedAt: string;
  responseDeadlineAt?: string;
  resolutionDeadlineAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  hasWorkOrder?: boolean;
  departmentId?: string;
  department?: { id: string; name: string };
  wardId?: string;
  ward?: string;
  location: {
    address: string;
    latitude: number | null;
    longitude: number | null;
    ward?: string;
    zone?: string;
  };
  category: {
    name: string;
    description: string | null;
  };
  municipality: {
    name: string;
  };
  statusHistory: StatusHistoryEntry[];
}

export interface ICreateWorkOrderPayload {
  civicIssueId: string;
  title?: string;
  description?: string;
  scheduledAt?: string;
}
