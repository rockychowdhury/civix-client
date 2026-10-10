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
  // Backend stores ward numbers as strings (`z.string()`).
  number: string;
  zoneId: string;
  zone?: { id?: string; name?: string };
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
  number: string;
  zoneId: string;
  coverageStatus?: string;
}

export interface UpdateWardPayload {
  name?: string;
  number?: string;
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
