// Removed StaffProfile import to fix type error

export type AssignmentStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "UNASSIGNED";
export type WorkOrderStatus =
  | "WORK_ORDER_CREATED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED"
  | "ON_HOLD";

export type WorkUpdateType =
  | "ACCEPTED"
  | "ON_SITE"
  | "PROGRESS"
  | "BLOCKED"
  | "DELAYED"
  | "PAUSED"
  | "RESUMED"
  | "COMPLETED";

export interface Assignment {
  id: string;
  workOrderId: string;
  assignedToId?: string;
  assignedById?: string;
  teamId?: string | null;
  status: AssignmentStatus | string;
  reason?: string | null;
  notes?: string | null;
  assignedAt?: string;
  acceptedAt?: string | null;
  createdAt?: string;
  team?: { name?: string } | null;
  workOrder?: WorkOrder | null;
}

export interface WorkUpdate {
  id: string;
  workOrderId: string;
  technicianId?: string;
  updateType: WorkUpdateType | string;
  note?: string | null;
  createdAt: string;
  attachments?: { id: string; url?: string }[];
}

export interface WorkResolution {
  id: string;
  workOrderId: string;
  summary: string;
  submittedByUserId?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: string;

  civicIssueId: string;
  departmentId: string;

  civicIssue?: {
    id: string;
    issueNumber: string;
    title?: string;
    description?: string;
    location: any;
    priority?: { code: string; name: string };
    resolutionDeadlineAt?: string | null;
    attachments?: Array<{ id: string; url: string; fileType?: string }>;
    category?: { id: string; name: string };
  };

  department?: { id: string; name: string } | null;

  currentAssigneeId?: string | null;
  currentAssignee?: { employeeId?: string; firstName: string; lastName: string; user?: any } | null;

  suggestedAssigneeId?: string | null;
  suggestedAssignee?: {
    employeeId?: string;
    firstName: string;
    lastName: string;
    user?: any;
  } | null;
  assignmentStatus?: string; // e.g. "SUGGESTED", "PENDING_ASSIGNMENT"

  assignments?: Array<{
    id: string;
    status: string;
    assignedTo?: { employeeId?: string; firstName: string; lastName: string } | null;
    team?: { name: string } | null;
  }>;

  updates?: WorkUpdate[];
  resolution?: WorkResolution | null;

  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IUpdateWorkOrderPayload {
  status?: WorkOrderStatus;
  notes?: string;
}

export interface IAssignTechnicianPayload {
  technicianId: string;
  reason?: string;
}

export interface ISubmitWorkUpdatePayload {
  updateType: string;
  notes?: string;
  attachmentIds?: string[];
}

export interface ISubmitResolutionPayload {
  summary: string;
}
