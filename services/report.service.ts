import { env } from "@/lib/config/env";
import { ApiError, apiClient } from "@/services/api.service";
import type { ICreateServiceRequestPayload } from "@/lib/validations/report";

export type ServiceRequestResponse = {
  id: string;
  trackingNumber: string;
  civicIssueId: string;
  categoryId: string;
  municipalityId: string;
  citizenId: string;
  locationId: string;
  description: string;
  status: string;
  attachments: any[];
  location: any;
  category: any;
  civicIssue: any;
};

export async function createServiceRequest(
  payload: ICreateServiceRequestPayload,
): Promise<ServiceRequestResponse> {
  return apiClient.post<ServiceRequestResponse>("/service-request", payload);
}

export async function uploadAttachments(serviceRequestId: string, files: File[]): Promise<void> {
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // Or whatever the backend expects, assuming 'files'
  });

  const response = await fetch(
    `${env.apiUrl}/attachments/service-request/${serviceRequestId}`,
    {
      method: "POST",
      body: formData,
      // Note: When sending FormData, do not set the Content-Type header,
      // the browser will automatically set it to multipart/form-data with the correct boundary
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message ??
      errorBody?.error ??
      `Attachment upload failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }
}
