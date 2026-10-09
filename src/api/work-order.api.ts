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
  filters?: Record<string, string>
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
  payload: { status: string; notes?: string }
): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function assignTechnician(
  id: string, 
  payload: { technicianId: string; reason?: string }
): Promise<any> {
  const res = await apiClient(`/assignments`, {
    method: "POST",
    body: JSON.stringify({
      workOrderId: id,
      assignedToId: payload.technicianId
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
  const res = await apiClient(`/work-orders/technician/queue${query}`);
  return res as { data: any[] };
}

export async function acceptWorkOrder(id: string): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/accept`, {
    method: "PATCH",
  });
  return res.data;
}

export async function submitWorkUpdate(id: string, payload: { updateText: string; attachments?: string[] }): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/update`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function submitResolution(id: string, payload: { resolutionNotes: string; afterPhotos?: string[] }): Promise<any> {
  const res = await apiClient(`/work-orders/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
