export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  workInstructions?: string | null;
  parentId: string | null;
  departmentId: string | null;
  baseSeverity: number;
  sortOrder: number;
  isActive: boolean;
  department?: Department | null;
}

export interface CategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
