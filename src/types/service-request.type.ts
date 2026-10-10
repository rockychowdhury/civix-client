export interface ServiceRequestCitizen {
  id?: string;
  name?: string;
  phone?: string | null;
  trustLevel?: string | number;
  trustScore?: number;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    phone?: string | null;
  } | null;
}

export interface ServiceRequest {
  id: string;
  trackingNumber: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string; slug?: string };
  location: {
    id?: string;
    address: string;
    ward?: string | { id?: string; name?: string; number?: string };
    wardId?: string;
    zone?: string | { id?: string; name?: string };
    zoneId?: string;
    landmark?: string | null;
    postalCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  status: string;
  citizenId?: string;
  citizen?: ServiceRequestCitizen | null;
  linkedIssueId?: string;
  linkedIssue?: { id: string; issueNumber: string };
  attachments: {
    id: string;
    url: string;
    fileType?: string;
    type?: string;
    fileName?: string;
    fileSize?: number;
    purpose?: string;
  }[];
  submittedAt: string;
  needsReview: boolean;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  slaTarget?: string;
  feedback?: {
    id: string;
    resolutionId?: string | null;
    rating: number;
    comment?: string | null;
    createdAt?: string;
  } | null;
  civicIssue?: {
    id: string;
    issueNumber: string;
    title?: string;
    status: string;
    priority?:
      | {
          id?: string;
          code?: string;
          name?: string;
          colorCode?: string | null;
        }
      | string;
    description?: string;
    workOrders?: Array<{
      id: string;
      title?: string;
      status?: string;
      currentAssigneeId?: string | null;
      currentAssignee?: {
        id?: string;
        employeeId?: string;
        name?: string;
      } | null;
      resolution?: {
        id: string;
        summary: string;
        createdAt: string;
        attachments?: Array<{ id: string; url: string; fileType?: string }>;
      } | null;
    }>;
  } | null;
}
