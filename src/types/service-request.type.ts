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
}
