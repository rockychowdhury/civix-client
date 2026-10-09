import apiClient from "@/lib/apiClient";
import type { ICreateWorkOrderPayload } from "@/types";

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

export async function getMyQueue(filters?: Record<string, string>): Promise<{ data: any[] }> {
  const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
  const res = await apiClient(`/assignments/my-assignments${query}`);
  return res as { data: any[] };
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
    body: JSON.stringify({ status: "REJECTED", ...(reason ? { reason } : {}) }),
  });
  return res.data;
}

export async function updateAssignmentStatus(
  id: string,
  payload: { status: "ACCEPTED" | "REJECTED"; reason?: string },
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
  payload: { updateText: string; attachments?: string[] },
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/updates`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function submitResolution(
  id: string,
  payload: { resolutionNotes: string; afterPhotos?: string[] },
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/resolutions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
