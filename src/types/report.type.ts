export type ServiceRequestResponse = {
  id: string;
  trackingNumber: string;
  civicIssueId?: string;
  categoryId?: string;
  municipalityId?: string;
  citizenId?: string;
  locationId?: string;
  description?: string;
  status: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  attachments?: string[];
  location?: {
    id?: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    landmark?: string | null;
    postalCode?: string | null;
    wardId?: string | null;
    zoneId?: string | null;
    municipalityId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  category?: {
    id?: string;
    name?: string;
    slug?: string;
    departmentId?: string;
    baseSeverity?: number;
  };
  civicIssue?: {
    id?: string;
    issueNumber?: string;
    municipalityId?: string;
    categoryId?: string;
    locationId?: string;
    departmentId?: string;
    wardId?: string;
    title?: string;
    description?: string;
    status?: string;
    priorityId?: string;
    reportedCount?: number;
    firstReportedAt?: string;
    lastReportedAt?: string;
    responseDeadlineAt?: string | null;
    resolutionDeadlineAt?: string | null;
    closedAt?: string | null;
    resolvedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    category?: {
      name?: string;
    };
  };
};

export type AttachmentPurpose = "REPORT_EVIDENCE";

export interface IUploadAttachmentPayload {
  purpose: AttachmentPurpose;
}
