// Removed StaffProfile import to fix type error

export type AssignmentStatus = "SUGGESTED" | "PENDING_ASSIGNMENT" | "CONFIRMED" | "REASSIGNED";
export type WorkOrderStatus =
  | "WORK_ORDER_CREATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ON_HOLD";

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
    location: any;
    priority?: { code: string; name: string };
    resolutionDeadlineAt?: string | null;
  };

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
