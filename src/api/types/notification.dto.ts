export interface NotificationItemDto {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | string;
  isRead: boolean;
  data?: Record<string, any>;
  link?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface PaginatedNotificationsResult {
  items: NotificationItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
