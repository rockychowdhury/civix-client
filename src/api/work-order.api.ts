import apiClient from "@/lib/apiClient";
import type {
  ICreateWorkOrderPayload,
  ISubmitResolutionPayload,
  ISubmitWorkUpdatePayload,
} from "@/types";
import { cleanParams } from "@/utils";

export async function createWorkOrder(payload: ICreateWorkOrderPayload): Promise<any> {
  const res = await apiClient(`/work-orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getDepartmentWorkOrders(
  departmentId: string,
  filters?: Record<string, any>,
): Promise<{ data: any[]; meta?: any }> {
  const res = await apiClient<{ data: any[]; meta?: any }>(
    `/work-orders/department/${departmentId}`,
    {
      params: cleanParams(filters),
    },
  );
  return res as { data: any[]; meta?: any };
}

export async function getWorkOrderById(id: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}`);
  return res.data;
}

export async function getWorkOrderUpdates(id: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/updates`);
  return res.data;
}

export async function getWorkOrderResolutions(workOrderId: string): Promise<any> {
  const res = await apiClient(`/work-orders/${workOrderId}/resolutions`);
  return res.data;
}

export async function updateWorkOrderStatus(
  id: string,
  payload: { status: string; notes?: string },
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function assignTechnician(
  id: string,
  payload: {
    technicianId?: string;
    assignedToId?: string;
    teamId?: string;
    notes?: string;
    reason?: string;
  },
): Promise<any> {
  const res = await apiClient(`/assignments`, {
    method: "POST",
    body: JSON.stringify({
      workOrderId: id,
      assignedToId: payload.assignedToId || payload.technicianId || undefined,
      teamId: payload.teamId || undefined,
      notes: payload.notes || payload.reason || undefined,
    }),
  });
  return res.data;
}

export async function confirmSuggestedTechnician(id: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/confirm-suggestion`, {
    method: "PATCH",
  });
  return res.data;
}

export interface MyQueueFilter {
  status?: string;
  workOrderId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export async function getMyQueue(filters?: MyQueueFilter): Promise<{
  data: any[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await apiClient<{ data: any[]; meta?: any }>(`/assignments/my-assignments`, {
    params: cleanParams(filters),
  });
  return res as { data: any[]; meta?: any };
}

export async function getAssignmentById(id: string): Promise<any> {
  const res = await apiClient(`/assignments/${id}`);
  return res.data;
}

export async function acceptWorkOrder(id: string): Promise<any> {
  const res = await apiClient(`/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "ACCEPTED" }),
  });
  return res.data;
}

export async function rejectAssignment(id: string, reason?: string): Promise<any> {
  const res = await apiClient(`/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "REJECTED", ...(reason ? { notes: reason } : {}) }),
  });
  return res.data;
}

export async function updateAssignmentStatus(
  id: string,
  payload: { status: "ACCEPTED" | "REJECTED"; notes?: string },
): Promise<any> {
  const res = await apiClient(`/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function startWorkOrder(id: string, notes?: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "IN_PROGRESS", ...(notes ? { notes } : {}) }),
  });
  return res.data;
}

export async function submitWorkUpdate(
  id: string,
  payload: ISubmitWorkUpdatePayload,
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/updates`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function submitResolution(
  payload: ISubmitResolutionPayload | { workOrderId: string; [key: string]: any },
  legacyId?: string,
): Promise<any> {
  const workOrderId = payload.workOrderId || legacyId;
  const body = {
    workOrderId,
    rootCause: payload.rootCause,
    notes: payload.notes || payload.summary,
    summary: payload.summary || payload.notes,
    costIncurred: payload.costIncurred ?? payload.actualCost,
    actualCost: payload.actualCost ?? payload.costIncurred,
    attachmentIds: payload.attachmentIds || [],
  };

  try {
    const res = await apiClient(`/resolutions`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.data;
  } catch (err) {
    if (workOrderId) {
      const res = await apiClient(`/work-orders/${workOrderId}/resolutions`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res.data;
    }
    throw err;
  }
}

export async function updateWorkOrderTask(
  workOrderId: string,
  taskId: string,
  payload: { isCompleted: boolean },
): Promise<any> {
  const res = await apiClient(`/work-orders/${workOrderId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export interface MyWorkOrdersFilter {
  stage?: "active" | "pending" | "verification" | "completed" | string;
  status?: string;
  priority?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getMyWorkOrders(filters?: MyWorkOrdersFilter): Promise<{
  data: any[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await apiClient<{ data: any[]; meta?: any }>(`/work-orders/my-work-orders`, {
    params: cleanParams(filters),
  });
  return res as { data: any[]; meta?: any };
}

export async function quickActionWorkOrder(
  id: string,
  payload: {
    action: "START" | "PAUSE" | "RESUME";
    reason?: string;
    notes?: string;
    attachmentIds?: string[];
  },
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/quick-action`, {
    method: "PATCH",
    body: JSON.stringify({
      action: payload.action,
      reason: payload.reason || payload.notes,
      notes: payload.notes || payload.reason,
      attachmentIds: payload.attachmentIds,
    }),
  });
  return res.data;
}

export async function uploadFieldAttachment(
  file: File,
  purpose: "BEFORE_WORK" | "DURING_WORK" | "AFTER_WORK" | "VERIFICATION" = "AFTER_WORK",
): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);
  const res = await apiClient<{ data: { id: string; url: string } }>("/attachments", {
    method: "POST",
    body: formData,
  });
  return res.data;
}
