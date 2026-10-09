import apiClient from "@/lib/apiClient";
import { cleanParams } from "@/utils";

export interface CityNotification {
  id: string;
  userId?: string;
  type?: string;
  title: string;
  message: string;
  isRead?: boolean;
  readAt?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt?: string;
}

export interface NotificationFilter {
  searchTerm?: string;
  type?: string;
  isRead?: boolean;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export function getNotifications(params?: NotificationFilter) {
  return apiClient<{
    data: CityNotification[];
    meta?: { page: number; limit: number; total: number; totalPages: number; unreadCount?: number };
  }>("/notifications", { params: cleanParams(params) });
}

export function markNotificationRead(id: string) {
  return apiClient<{ data: CityNotification }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead() {
  return apiClient<{ data: unknown }>(`/notifications/mark-all-read`, {
    method: "PATCH",
  });
}
