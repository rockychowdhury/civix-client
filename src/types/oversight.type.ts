export interface OversightFilter {
  searchTerm?: string;
  municipalityId?: string;
  departmentId?: string;
  wardId?: string;
  priority?: string;
  status?: string;
  requestType?: string;
  unTriaged?: boolean;
  rating?: number;
  citizenId?: string;
  page?: number;
  limit?: number;
}

export interface UpdateIssueStatusPayload {
  status: string;
  notes?: string;
}
