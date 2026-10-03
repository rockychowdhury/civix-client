import apiClient from "@/lib/apiClient";
import type { ICreateWorkOrderPayload } from "@/types";

export async function createWorkOrder(payload: ICreateWorkOrderPayload): Promise<any> {
  const res = await apiClient(`/work-orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
