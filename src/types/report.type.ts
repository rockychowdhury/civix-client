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

export type AttachmentPurpose = "REPORT_EVIDENCE";

export interface IUploadAttachmentPayload {
  purpose: AttachmentPurpose;
}
