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
  filters?: Record<string, string>,
): Promise<{ data: any[] }> {
  const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
  const res = await apiClient(`/work-orders/department/${departmentId}${query}`);
  return res as { data: any[] };
}

export async function getWorkOrderById(id: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}`);
  return res.data;
}

export async function getWorkOrderUpdates(id: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/updates`);
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
  payload: { technicianId: string; reason?: string },
): Promise<any> {
  const res = await apiClient(`/assignments`, {
    method: "POST",
    body: JSON.stringify({
      workOrderId: id,
      assignedToId: payload.technicianId,
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
  id: string,
  payload: ISubmitResolutionPayload,
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/resolutions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
