import apiClient from "@/lib/apiClient";
import type { ITeamFilter, ITeamListResponse, ITeam, ICreateTeamPayload, IUpdateTeamPayload } from "@/types";

export function getTeams(params?: ITeamFilter) {
  return apiClient<ITeamListResponse>("/teams", { method: "GET", params: params as any });
}

export function getTeamById(id: string) {
  return apiClient<{ data: ITeam }>(`/teams/${id}`, { method: "GET" });
}

export function createTeam(payload: ICreateTeamPayload) {
  return apiClient<{ data: ITeam }>("/teams", { method: "POST", body: payload });
}

export function updateTeam(id: string, payload: IUpdateTeamPayload) {
  return apiClient<{ data: ITeam }>(`/teams/${id}`, { method: "PATCH", body: payload });
}

export function deleteTeam(id: string) {
  return apiClient<{ data: any }>(`/teams/${id}`, { method: "DELETE" });
}
