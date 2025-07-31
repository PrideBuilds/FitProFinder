import type { Trainer, SearchFilters, SearchResult, User, SessionType, Review, Conversation, Message, GetConversationsResponse, GetMessagesResponse, SearchMessagesResponse, CreateConversationRequest, SendMessageRequest, ConversationStats } from '../types';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api';

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  message?: string;
}

// Authentication token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'fitpro_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'fitpro_refresh_token';

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...TokenManager.getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data.data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'client' | 'trainer';
    phoneNumber?: string;
  }) => {
    const response = await apiRequest<{
      user: User;
      tokens: {
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens
    TokenManager.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest<{
      user: User;
      tokens: {
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens
    TokenManager.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      TokenManager.clearTokens();
    }
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return await apiRequest<{ user: User }>('/auth/me');
  },

  verifyEmail: async (token: string) => {
    return await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
};

// Trainers API
export const trainersApi = {
  getTrainers: async (filters: Partial<SearchFilters> = {}): Promise<SearchResult> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else if (typeof value === 'string' && value !== '') {
          queryParams.append(key, value);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          queryParams.append(key, value.toString());
        } else if (typeof value === 'object' && value !== null) {
          // Handle complex objects like location or priceRange
          if ('min' in value && 'max' in value) {
            // Price range object
            queryParams.append(`${key}Min`, value.min.toString());
            queryParams.append(`${key}Max`, value.max.toString());
          } else if ('city' in value || 'state' in value || 'zipCode' in value) {
            // Location object
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined && subValue !== null && subValue !== '') {
                queryParams.append(`${key}.${subKey}`, subValue.toString());
              }
            });
          }
        }
      }
    });

    const endpoint = `/trainers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiRequest<SearchResult>(endpoint);
  },

  getTrainerById: async (id: string): Promise<{
    trainer: Trainer & {
      contact: {
        email: string;
        phoneNumber?: string;
      };
      sessionTypes: SessionType[];
      reviews: Review[];
      ratingStats: {
        totalReviews: number;
        avgRating: number;
        breakdown: Record<number, number>;
      };
      joinedDate: string;
    };
  }> => {
    return await apiRequest<{
      trainer: Trainer & {
        contact: {
          email: string;
          phoneNumber?: string;
        };
        sessionTypes: SessionType[];
        reviews: Review[];
        ratingStats: {
          totalReviews: number;
          avgRating: number;
          breakdown: Record<number, number>;
        };
        joinedDate: string;
      };
    }>(`/trainers/${id}`);
  },

  updateProfile: async (profileData: {
    businessName?: string;
    bio: string;
    experienceYears: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    specialties: Array<{ id: number; experienceYears?: number }>;
    sessionTypes?: Array<{
      name: string;
      description?: string;
      duration: number;
      price: number;
      type?: 'individual' | 'group' | 'package';
      maxParticipants?: number;
      allowsOnline?: boolean;
      allowsInPerson?: boolean;
    }>;
    offersOnline?: boolean;
    offersInPerson?: boolean;
    socialLinks?: Record<string, string>;
  }) => {
    return await apiRequest('/trainers/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }
};

// Search API (shorthand for trainers search)
export const searchApi = {
  searchTrainers: trainersApi.getTrainers,
  
  getSpecialties: async (): Promise<Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    iconName?: string;
    color?: string;
    imageUrl?: string;
  }>> => {
    return await apiRequest<Array<{
      id: number;
      name: string;
      slug: string;
      description?: string;
      iconName?: string;
      color?: string;
      imageUrl?: string;
    }>>('/specialties');
  }
};

// Messaging API
export const messagingApi = {
  // Conversations
  getConversations: async (page = 1, limit = 20): Promise<GetConversationsResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Use fetch directly to get the full response structure
    const response = await fetch(`${API_BASE_URL}/messages/conversations?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders(),
      },
    });

    const result: ApiResponse<{ conversations: Conversation[]; pagination: any }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to get conversations');
    }

    // Return in the expected format
    return {
      conversations: result.data?.conversations || [],
      pagination: result.data?.pagination || { currentPage: page, totalPages: 1, totalCount: 0, hasNextPage: false, hasPrevPage: false, limit }
    };
  },

  createOrGetConversation: async (data: CreateConversationRequest): Promise<{ conversation: Conversation }> => {
    return await apiRequest<{ conversation: Conversation }>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getConversationStats: async (conversationId: string): Promise<{ stats: ConversationStats }> => {
    return await apiRequest<{ stats: ConversationStats }>(`/messages/conversations/${conversationId}/stats`);
  },

  // Messages
  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<GetMessagesResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Use fetch directly to get the full response structure
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders(),
      },
    });

    const result: ApiResponse<Message[]> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to get messages');
    }

    // Return in the expected format
    return {
      messages: result.data || [],
      pagination: (result as any).pagination || { currentPage: page, totalPages: 1, totalCount: 0, hasNextPage: false, hasPrevPage: false, limit }
    };
  },

  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<{ message: Message }> => {
    // Handle file uploads separately if attachments exist
    if (data.attachments && data.attachments.length > 0) {
      return await messagingApi.sendMessageWithFiles(conversationId, data);
    }

    // Send text message
    const { attachments, ...messageData } = data;
    return await apiRequest<{ message: Message }>(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  sendMessageWithFiles: async (conversationId: string, data: SendMessageRequest): Promise<{ message: Message }> => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.messageType) formData.append('messageType', data.messageType);
    if (data.replyToMessageId) formData.append('replyToMessageId', data.replyToMessageId);
    
    // Add files
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append('files', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        ...TokenManager.getAuthHeaders(),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const result: ApiResponse<{ message: Message }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to send message with files');
    }

    return result.data as { message: Message };
  },

  markMessagesAsRead: async (conversationId: string, messageIds?: string[]): Promise<{ success: boolean }> => {
    const body = messageIds ? { messageIds } : {};
    return await apiRequest<{ success: boolean }>(`/messages/conversations/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // File upload
  uploadFiles: async (files: File[]): Promise<{ files: Array<{ url: string; filename: string; size: number; type: string }> }> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/messages/upload`, {
      method: 'POST',
      headers: {
        ...TokenManager.getAuthHeaders(),
      },
      body: formData,
    });

    const result: ApiResponse<{ files: Array<{ url: string; filename: string; size: number; type: string }> }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to upload files');
    }

    return result.data as { files: Array<{ url: string; filename: string; size: number; type: string }> };
  },

  // Search
  searchMessages: async (query: string, page = 1, limit = 20): Promise<SearchMessagesResponse> => {
    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    return await apiRequest<SearchMessagesResponse>(`/messages/search?${queryParams}`);
  },

  // Socket stats (for debugging/monitoring)
  getSocketStats: async (): Promise<{ stats: any }> => {
    return await apiRequest<{ stats: any }>('/messages/socket/stats');
  },
};

// Export token manager for use in components
export { TokenManager };

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return TokenManager.getAccessToken() !== null;
};

// Utility function to get current user role from token (basic JWT decode)
export const getCurrentUserRole = (): string | null => {
  const token = TokenManager.getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
};

// Error handling types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 