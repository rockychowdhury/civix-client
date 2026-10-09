export interface AdminZone {
  id: string;
  name: string;
  municipalityId: string;
  coverageStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminWard {
  id: string;
  name: string;
  number: number;
  zoneId: string;
  coverageStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateZonePayload {
  name: string;
  municipalityId: string;
  coverageStatus?: string;
}

export interface UpdateZonePayload {
  name?: string;
  coverageStatus?: string;
}

export interface CreateWardPayload {
  name: string;
  number?: number;
  zoneId: string;
  coverageStatus?: string;
}

export interface UpdateWardPayload {
  name?: string;
  number?: number;
  zoneId?: string;
  coverageStatus?: string;
}

export interface JurisdictionFilter {
  searchTerm?: string;
  municipalityId?: string;
  zoneId?: string;
  coverageStatus?: string;
  page?: number;
  limit?: number;
}
