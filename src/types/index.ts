export interface Organisation {
  id: number;
  name: string;
  code?: string | null;
  logo_url?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  timezone?: string;
  is_active: boolean;
  is_approved?: number;
  block_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  host_available_message?: string;
  host_unavailable_message?: string;
}

export interface Host {
  id: number;
  organisation_id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  designation: string;
  department: string;
  profile_pic: string;
  is_available: boolean;
  is_active: boolean;
  organisation?: Organisation;
}

export interface DashboardStats {
  total_organisations: number;
  active_organisations: number;
  pending_requests?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}


export interface AdminUserItem {
  id: number;
  email: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  is_approved: number; // 0 = Pending, 1 = Approved, 2 = Denied
  is_blocked: boolean;
}