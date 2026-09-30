export interface StatusHistoryEntry {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface CivicIssue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  status: string;
  reportedCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  createdAt: string;
  updatedAt: string;
  location: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  category: {
    name: string;
    description: string | null;
  };
  municipality: {
    name: string;
  };
  statusHistory: StatusHistoryEntry[];
}
