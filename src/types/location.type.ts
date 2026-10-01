export interface Municipality {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface Zone {
  id: string;
  name: string;
  municipalityId: string;
  coverageStatus?: string;
}

export interface Ward {
  id: string;
  name: string;
  zoneId: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
