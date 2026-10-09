export interface AdminSlaPolicy {
  id: string;
  municipalityId?: string;
  categoryId?: string;
  priorityId?: string;
  responseMinutes?: number;
  resolutionMinutes?: number;
  version?: number;
  assignmentType?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  createdAt?: string;
  municipality?: { name?: string };
  category?: { name?: string };
  priority?: { name?: string; code?: string; weight?: number };
}

export interface SlaPolicyFilter {
  municipalityId?: string;
  categoryId?: string;
}

export interface CreateSlaPolicyPayload {
  municipalityId?: string;
  categoryId?: string;
  priorityId?: string;
  responseMinutes: number;
  resolutionMinutes: number;
  assignmentType?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdateSlaPolicyPayload {
  responseMinutes?: number;
  resolutionMinutes?: number;
  assignmentType?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  departmentId?: string;
  baseSeverity?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  parentId?: string | null;
  departmentId?: string;
  baseSeverity?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AdminCategoryFilter {
  searchTerm?: string;
  departmentId?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
