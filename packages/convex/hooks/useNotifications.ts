import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useMyNotifications(unreadOnly?: boolean) {
  return useQuery(api.notifications.getMyNotifications, { unreadOnly });
}

export function useUnreadNotificationCount() {
  return useQuery(api.notifications.getUnreadNotificationCount);
}

export function useCreateNotification() {
  return useMutation(api.notifications.createNotification);
}

export function useMarkNotificationAsRead() {
  return useMutation(api.notifications.markNotificationAsRead);
}

export function useMarkAllNotificationsAsRead() {
  return useMutation(api.notifications.markAllNotificationsAsRead);
}

export function useDeleteNotification() {
  return useMutation(api.notifications.deleteNotification);
}
