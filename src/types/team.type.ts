export interface ITeam {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  leaderId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  leader?: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
  members?: Array<{
    teamId: string;
    staffId: string;
    staff: {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface ICreateTeamPayload {
  name: string;
  code: string;
  departmentId: string;
  leaderId?: string;
  memberIds?: string[];
}

export interface IUpdateTeamPayload {
  name?: string;
  status?: string; // "ACTIVE", "INACTIVE", "DISBANDED"
  leaderId?: string;
}

export interface ITeamFilter {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface ITeamListResponse {
  data: ITeam[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
