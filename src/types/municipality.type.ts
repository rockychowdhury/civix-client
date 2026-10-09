export type CoverageStatus = "ACTIVE" | "INACTIVE" | "PLANNED";

export interface AdminMunicipality {
  id: string;
  name: string;
  code: string;
  countryCode?: string;
  timezone?: string;
  coverageStatus: CoverageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMunicipalityPayload {
  name: string;
  code: string;
  countryCode?: string;
  timezone?: string;
  coverageStatus?: CoverageStatus;
}

export interface UpdateMunicipalityPayload {
  name?: string;
  code?: string;
  countryCode?: string;
  timezone?: string;
  coverageStatus?: CoverageStatus;
}

export interface MunicipalityFilter {
  searchTerm?: string;
  coverageStatus?: CoverageStatus;
  page?: number;
  limit?: number;
}
