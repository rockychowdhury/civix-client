export interface ICreateStaffPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  designation?: string;
  departmentId: string;
}

export interface IUpdateStaffPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
}

export interface IStaffFilter {
  searchTerm?: string;
  departmentId?: string;
  role?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IStaffProfile {
  // NOTE: StaffProfile's primary key is `userId` — the API returns no `id`.
  // `id` is kept optional for backwards compatibility; always key by `userId`.
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  designation: string | null;
  municipalityId: string | null;
  currentWorkload?: number;
  maxWorkload?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    status: string;
    userRoles?: Array<{ role: { code: string } }>;
  };
  departmentMembers?: Array<{
    department: { id: string; name: string };
    role: string;
  }>;
}

export interface IStaffListResponse {
  data: IStaffProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
