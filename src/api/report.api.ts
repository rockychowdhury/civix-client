import apiClient from "@/lib/apiClient";
import type { ICreateServiceRequestPayload } from "@/validation";
import type { ServiceRequestResponse, IUploadAttachmentPayload } from "@/types";

export async function createServiceRequest(payload: ICreateServiceRequestPayload) {
  const res = await apiClient<{ data: ServiceRequestResponse }>("/service-requests", { method: "POST", body: payload });
  return res.data;
}

export async function uploadAttachments(id: string, files: File[], payload: IUploadAttachmentPayload = { purpose: "REPORT_EVIDENCE" }) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("purpose", payload.purpose);
  const res = await apiClient<{ data: { urls: string[] } }>(`/attachments/service-request/${id}`, {
    method: "POST",
    body: formData,
  });
  return res.data;
}
