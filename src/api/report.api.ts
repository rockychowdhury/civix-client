import apiClient from "@/lib/apiClient";
import type { ICreateServiceRequestPayload } from "@/validation";

export type ServiceRequestResponse = {
  id: string;
  trackingNumber: string;
  civicIssue: {
    reportedCount?: number;
    category?: {
      name: string;
    };
  };
  category?: {
    name: string;
  };
  status: string;
};

export function createServiceRequest(payload: ICreateServiceRequestPayload) {
  return apiClient<ServiceRequestResponse>("/reports", { method: "POST", body: payload });
}

export function uploadAttachments(id: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return apiClient<{ urls: string[] }>(`/reports/${id}/media`, {
    method: "POST",
    body: formData,
  });
}
