import apiClient from "@/lib/apiClient";
import type { IUploadAttachmentPayload, ServiceRequestResponse } from "@/types";
import type { ICreateServiceRequestPayload } from "@/validation";

export async function createServiceRequest(payload: ICreateServiceRequestPayload) {
  const res = await apiClient<{ data: ServiceRequestResponse }>("/service-requests", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function uploadAttachments(
  id: string,
  files: File[],
  payload: IUploadAttachmentPayload = { purpose: "REPORT_EVIDENCE" },
) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("purpose", payload.purpose);
  const res = await apiClient<{ data: { urls: string[] } }>(`/attachments/service-request/${id}`, {
    method: "POST",
    body: formData,
  });
  return res.data;
}
