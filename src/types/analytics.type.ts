export interface PlatformDashboardStats {
  totalIssues: number;
  resolvedIssues: number;
  openIssues: number;
  breachedIssues: number;
  resolutionRate: number;
}

export interface IssuesByDepartment {
  id: string;
  name: string;
  issueCount: number;
}

export interface IssuesByWard {
  id: string;
  name: string;
  number: number;
  issueCount: number;
}
