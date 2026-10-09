export interface ServiceRequest {
  id: string;
  trackingNumber: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string };
  location: { address: string; ward: string; zone: string };
  status: string;
  linkedIssueId?: string;
  linkedIssue?: { id: string; issueNumber: string };
  attachments: { id: string; url: string; type: string }[];
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
    rating: number;
    comment?: string | null;
    createdAt?: string;
  } | null;
  civicIssue?: {
    id: string;
    issueNumber: string;
    title?: string;
    status: string;
    priority?: string;
    description?: string;
  };
}
