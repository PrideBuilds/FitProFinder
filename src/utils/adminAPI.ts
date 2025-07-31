import { apiRequest } from './api';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: number;
  lastLoginAt?: number;
  adminLevel?: string;
  adminSince?: number;
}

export interface AdminDashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTrainers: number;
    activeTrainers: number;
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
    messagesLast24h: number;
  };
  userGrowth: Array<{ date: string; count: number }>;
  recentUsers: AdminUser[];
  recentActivity: Array<{
    id: string;
    admin_id: string;
    action: string;
    target_type: string;
    target_id?: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
    first_name: string;
    last_name: string;
  }>;
  systemHealth: {
    database: {
      status: string;
      responseTime: number;
    };
    errors: any[];
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    timestamp: string;
  };
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminAPI = {
  // Dashboard
  async getDashboard(): Promise<AdminDashboardData> {
    const response = await apiRequest('/admin/dashboard');
    return response as AdminDashboardData;
  },

  // Users
  async getUsers(page = 1, limit = 50, filters: any = {}): Promise<PaginatedResponse<AdminUser[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await apiRequest(`/admin/users?${params}`) as any;
    return {
      data: response.users,
      pagination: response.pagination
    };
  },

  async getUser(id: string): Promise<AdminUser> {
    const response = await apiRequest(`/admin/users/${id}`) as any;
    return response.user;
  },

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    const response = await apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }) as any;
    return response.user;
  },

  async updateUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    const response = await apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }) as any;
    return response.user;
  },

  async deleteUser(id: string): Promise<void> {
    await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin Management
  async getAdmins(): Promise<AdminUser[]> {
    const response = await apiRequest('/admin/admins');
    return response as AdminUser[];
  },

  async promoteToAdmin(userId: string, level: string = 'admin'): Promise<void> {
    await apiRequest(`/admin/admins/${userId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ level })
    });
  },

  async updateAdminLevel(userId: string, level: string): Promise<void> {
    await apiRequest(`/admin/admins/${userId}/level`, {
      method: 'PUT',
      body: JSON.stringify({ level })
    });
  },

  async revokeAdmin(userId: string): Promise<void> {
    await apiRequest(`/admin/admins/${userId}/revoke`, {
      method: 'DELETE'
    });
  },

  // Activity Logs
  async getLogs(page = 1, limit = 50, filters: any = {}): Promise<PaginatedResponse<AdminLog[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await apiRequest(`/admin/logs?${params}`) as any;
    return {
      data: response.logs,
      pagination: response.pagination
    };
  },

  async getActivityLogs(page = 1, limit = 50): Promise<{ logs: AdminLog[] }> {
    const response = await apiRequest(`/admin/logs?page=${page}&limit=${limit}`) as any;
    return response;
  },

  // Profile
  async getProfile(): Promise<AdminUser> {
    const response = await apiRequest('/auth/me') as any;
    return response.user;
  },

  // System Health
  async getSystemHealth(): Promise<any> {
    return await apiRequest('/admin/system');
  },

  // Utility functions
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  formatDate(timestamp: number | string): string {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  },

  getAdminLevelColor(level: string): string {
    switch (level) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getUserRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'trainer':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}; 