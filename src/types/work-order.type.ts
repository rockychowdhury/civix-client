// Removed StaffProfile import to fix type error

export type AssignmentStatus = "SUGGESTED" | "PENDING_ASSIGNMENT" | "CONFIRMED" | "REASSIGNED";
export type WorkOrderStatus = "WORK_ORDER_CREATED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD";

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: string;
  
  civicIssueId: string;
  departmentId: string;
  
  civicIssue?: {
    issueNumber: string;
    location: any;
  };
  
  currentAssigneeId?: string | null;
  currentAssignee?: any | null;
  
  suggestedAssigneeId?: string | null;
  suggestedAssignee?: any | null;
  assignmentStatus?: string; // e.g. "SUGGESTED", "PENDING_ASSIGNMENT"
  
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
