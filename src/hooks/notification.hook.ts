import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CITY_QUERY_KEYS } from "@/constant/city.constant";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationFilter,
} from "../api";

export function useGetNotifications(params?: NotificationFilter) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.notifications, params],
    queryFn: () => getNotifications(params),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEYS.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEYS.notifications });
    },
  });
}
