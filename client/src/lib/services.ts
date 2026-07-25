import api from './api';
import type { ApiResponse, User, LostItem, FoundItem, Claim, Notification, MatchResult, Analytics, PaginatedData } from '@/types';

// ─── Auth ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<User>>('/auth/login', data),
  register: (data: { name: string; email: string; password: string; college: string; role?: string; department?: string; year?: number; rollNumber?: string; phone?: string }) =>
    api.post<ApiResponse<User>>('/auth/register', data),
  logout: () => api.post<ApiResponse>('/auth/logout'),
  refresh: () => api.post<ApiResponse>('/auth/refresh'),
  me: () => api.get<ApiResponse<User>>('/users/me'),
};

// ─── Lost Items ─────────────────────────────────────────────────────────
export const lostItemsApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<PaginatedData<LostItem>>>('/lost-items', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<LostItem>>(`/lost-items/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<LostItem>>('/lost-items', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<LostItem>>(`/lost-items/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/lost-items/${id}`),
  getMatches: (id: string) =>
    api.get<ApiResponse<{ lostItemId: string; matchesCount: number; matches: MatchResult[] }>>(`/lost-items/${id}/matches`),
};

// ─── Found Items ────────────────────────────────────────────────────────
export const foundItemsApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<PaginatedData<FoundItem>>>('/found-items', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<FoundItem>>(`/found-items/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<FoundItem>>('/found-items', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<FoundItem>>(`/found-items/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/found-items/${id}`),
};

// ─── Claims ─────────────────────────────────────────────────────────────
export const claimsApi = {
  create: (data: { lostItemId: string; foundItemId: string; verificationAnswers: { question: string; answer: string }[]; proofImages?: string[]; aiMatchScore?: number }) =>
    api.post<ApiResponse<Claim>>('/claims', data),
  getMy: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Claim>>>('/claims/my', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Claim>>(`/claims/${id}`),
  cancel: (id: string) =>
    api.patch<ApiResponse<Claim>>(`/claims/${id}/cancel`),
  review: (id: string, data: { status: 'APPROVED' | 'REJECTED'; adminRemarks?: string }) =>
    api.patch<ApiResponse<Claim>>(`/claims/${id}/review`, data),
  getPending: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Claim>>>('/claims/pending', { params }),
  getCollege: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedData<Claim>>>('/claims/college', { params }),
};

// ─── Admin ──────────────────────────────────────────────────────────────
export const adminApi = {
  getAnalytics: () =>
    api.get<ApiResponse<Analytics>>('/admin/analytics'),
  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<unknown>>>('/admin/audit-logs', { params }),
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Notification> & { unreadCount: number }>>('/admin/notifications', { params }),
  markNotificationRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () =>
    api.patch<ApiResponse>('/admin/notifications/read-all'),
};

// ─── Users ──────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<User>>>('/users', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
};

// ─── Colleges ───────────────────────────────────────────────────────────
export const collegesApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<{ colleges: unknown[]; total: number }>>>('/colleges', { params }),
  getById: (id: string) =>
    api.get<ApiResponse>(`/colleges/${id}`),
};
