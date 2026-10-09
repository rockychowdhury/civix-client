import { useQuery } from "@tanstack/react-query";
import { CITY_QUERY_KEYS } from "@/constant/city.constant";
import { getMunicipalityIssues } from "../api/issue.api";
import {
  getMunicipalityServiceRequests,
  getServiceRequestById,
  getServiceRequestsByCivicIssue,
  type MunicipalityRequestFilter,
} from "../api/service-requests";

export interface CityIssueFilter {
  searchTerm?: string;
  status?: string;
  priority?: string;
  departmentId?: string;
  wardId?: string;
  page?: number;
  limit?: number;
}

export function useGetCityIssues(municipalityId: string, params?: CityIssueFilter) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.cityIssues, municipalityId, params],
    queryFn: () => getMunicipalityIssues(municipalityId, params),
    enabled: !!municipalityId,
  });
}

export function useGetCityRequests(municipalityId: string, params?: MunicipalityRequestFilter) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.cityRequests, municipalityId, params],
    queryFn: () => getMunicipalityServiceRequests(municipalityId, params),
    enabled: !!municipalityId,
  });
}

export function useGetCityRequestById(id: string) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.cityRequests, id],
    queryFn: () => getServiceRequestById(id),
    enabled: !!id,
  });
}

export function useGetRequestsByCivicIssue(civicIssueId: string) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.cityRequests, "issue", civicIssueId],
    queryFn: () => getServiceRequestsByCivicIssue(civicIssueId, { limit: 50 }),
    enabled: !!civicIssueId,
  });
}
