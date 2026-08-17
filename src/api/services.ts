import apiClient from './client';
import type { Organisation, DashboardStats, ApiResponse, PaginatedResponse, Visitor, VisitorVisit } from '@/types';

export const organisationApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Organisation>>('/admin/organisations', { params }),
  
  getById: (id: number) =>
    apiClient.get<ApiResponse<Organisation>>(`/admin/organisations/${id}`),
  
  create: (data: FormData) =>
    apiClient.post<ApiResponse<Organisation>>('/admin/organisations', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<Organisation>>(`/admin/organisations/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  delete: (id: number) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/admin/organisations/${id}`),
  
  toggleStatus: (id: number) =>
    apiClient.patch<ApiResponse<Organisation>>(`/admin/organisations/${id}/toggle-status`),
};

export const adminDashboardApi = {
  getStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats'),
  
  getRecentOrganisations: (limit: number = 5) =>
    apiClient.get<ApiResponse<Organisation[]>>(`/admin/dashboard/recent?limit=${limit}`),
};

// ============================================================
// ADMIN - VISITOR API
// ============================================================
export const adminVisitorApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Visitor>>('/admin/visitors', { params }),
  
  getById: (id: number) =>
    apiClient.get<ApiResponse<Visitor>>(`/admin/visitors/${id}`),
};

// ============================================================
// ADMIN - VISIT API
// ============================================================
export const adminVisitApi = {
  getAll: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    apiClient.get<PaginatedResponse<VisitorVisit>>('/admin/visits', { params }),
  
  getById: (id: number) =>
    apiClient.get<ApiResponse<VisitorVisit>>(`/admin/visits/${id}`),
};