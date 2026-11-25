import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  NotificationItemDto,
  GetNotificationsParams,
  PaginatedNotificationsResult,
} from '../types/notification.dto';

export const notificationsService = {
  /**
   * GET {{baseUrl}}/notifications?page=1&limit=10
   */
  async getNotifications(params?: GetNotificationsParams): Promise<PaginatedNotificationsResult> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const queryParams: Record<string, any> = { page, limit };
    if (params?.unreadOnly) queryParams.unreadOnly = true;

    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: queryParams,
    });

    const resData = response.data;
    let items: any[] = [];
    let total = 0;
    let totalPages = 1;

    if (Array.isArray(resData?.data)) {
      items = resData.data;
      total = resData?.meta?.total || resData?.meta?.pagination?.totalItems || items.length;
      totalPages = resData?.meta?.totalPages || Math.ceil(total / limit) || 1;
    } else if (Array.isArray(resData?.data?.items)) {
      items = resData.data.items;
      total = resData.data.total ?? resData?.meta?.total ?? items.length;
      totalPages = resData.data.totalPages ?? Math.ceil(total / limit) ?? 1;
    } else if (Array.isArray(resData?.data?.notifications)) {
      items = resData.data.notifications;
      total = resData.data.total ?? items.length;
      totalPages = resData.data.totalPages ?? Math.ceil(total / limit) ?? 1;
    } else if (Array.isArray(resData)) {
      items = resData;
      total = items.length;
      totalPages = Math.ceil(total / limit) || 1;
    }

    const normalizedItems: NotificationItemDto[] = items.map((item: any) => ({
      id: String(item.id || item._id),
      userId: item.userId,
      title: item.title || 'Notification',
      message: item.message || item.body || item.content || '',
      type: item.type || 'info',
      isRead: !!(item.isRead || item.read),
      data: item.data || {},
      link: item.link || item.url,
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      updatedAt: item.updatedAt || item.updated_at,
    }));

    return {
      items: normalizedItems,
      total,
      page,
      limit,
      totalPages: Math.max(1, totalPages),
    };
  },

  /**
   * GET {{baseUrl}}/notifications/unread-count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      const resData = response.data;

      if (typeof resData === 'number') return resData;
      if (typeof resData?.count === 'number') return resData.count;
      if (typeof resData?.unreadCount === 'number') return resData.unreadCount;
      if (typeof resData?.data === 'number') return resData.data;
      if (typeof resData?.data?.count === 'number') return resData.data.count;
      if (typeof resData?.data?.unreadCount === 'number') return resData.data.unreadCount;

      return 0;
    } catch {
      return 0;
    }
  },

  /**
   * PATCH {{baseUrl}}/notifications/{{notificationId}}/read
   */
  async markAsRead(notificationId: string): Promise<any> {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
    return response.data;
  },

  /**
   * PATCH {{baseUrl}}/notifications/mark-all-read
   */
  async markAllAsRead(): Promise<any> {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },

  /**
   * DELETE {{baseUrl}}/notifications/{{notificationId}}
   */
  async deleteNotification(notificationId: string): Promise<any> {
    const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
    return response.data;
  },

  /**
   * DELETE {{baseUrl}}/notifications
   */
  async deleteAllNotifications(): Promise<any> {
    const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
    return response.data;
  },
};
