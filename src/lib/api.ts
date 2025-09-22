/**
 * API Client
 * Centralized API client with error handling and type safety
 */

import { API_CONFIG } from '../utils/constants';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  TrainerSearchRequest,
  TrainerSearchResponse,
} from '../types';

/**
 * API Client class for making HTTP requests
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authorization token for requests
   * @param token - JWT token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make HTTP request with error handling
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise with response data
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Promise with response data
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
    });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with response data
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with response data
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @returns Promise with response data
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create default API client instance
const apiClient = new ApiClient();

// Authentication API
export const authApi = {
  /**
   * Login user
   * @param credentials - Login credentials
   * @returns Promise with login response
   */
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Promise with registration response
   */
  register: (userData: any): Promise<ApiResponse<any>> => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * Logout user
   * @returns Promise with logout response
   */
  logout: (): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile
   * @returns Promise with user profile
   */
  getProfile: (): Promise<ApiResponse<any>> => {
    return apiClient.get('/auth/me');
  },

  /**
   * Refresh authentication token
   * @returns Promise with new tokens
   */
  refreshToken: (): Promise<ApiResponse<any>> => {
    return apiClient.post('/auth/refresh');
  },
};

// Trainers API
export const trainersApi = {
  /**
   * Search trainers
   * @param filters - Search filters
   * @returns Promise with search results
   */
  search: (
    filters: TrainerSearchRequest
  ): Promise<ApiResponse<TrainerSearchResponse>> => {
    return apiClient.get('/trainers/search', filters);
  },

  /**
   * Get featured trainers
   * @param limit - Number of trainers to return
   * @returns Promise with featured trainers
   */
  getFeatured: (limit: number = 6): Promise<ApiResponse<any>> => {
    return apiClient.get('/trainers/featured', { limit });
  },

  /**
   * Get trainer by ID
   * @param id - Trainer ID
   * @returns Promise with trainer details
   */
  getById: (id: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/trainers/${id}`);
  },

  /**
   * Get trainer specialties
   * @returns Promise with specialties list
   */
  getSpecialties: (): Promise<ApiResponse<any>> => {
    return apiClient.get('/trainers/specialties');
  },
};

// Bookings API
export const bookingsApi = {
  /**
   * Get user bookings
   * @param filters - Filter options
   * @returns Promise with bookings list
   */
  getBookings: (filters?: any): Promise<ApiResponse<any>> => {
    return apiClient.get('/bookings', filters);
  },

  /**
   * Create new booking
   * @param bookingData - Booking data
   * @returns Promise with created booking
   */
  createBooking: (bookingData: any): Promise<ApiResponse<any>> => {
    return apiClient.post('/bookings', bookingData);
  },

  /**
   * Update booking
   * @param id - Booking ID
   * @param bookingData - Updated booking data
   * @returns Promise with updated booking
   */
  updateBooking: (id: string, bookingData: any): Promise<ApiResponse<any>> => {
    return apiClient.put(`/bookings/${id}`, bookingData);
  },

  /**
   * Cancel booking
   * @param id - Booking ID
   * @returns Promise with cancellation response
   */
  cancelBooking: (id: string): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/bookings/${id}`);
  },
};

// Messages API
export const messagesApi = {
  /**
   * Get user conversations
   * @param pagination - Pagination options
   * @returns Promise with conversations list
   */
  getConversations: (pagination?: any): Promise<ApiResponse<any>> => {
    return apiClient.get('/messages/conversations', pagination);
  },

  /**
   * Get conversation messages
   * @param conversationId - Conversation ID
   * @param pagination - Pagination options
   * @returns Promise with messages list
   */
  getMessages: (
    conversationId: string,
    pagination?: any
  ): Promise<ApiResponse<any>> => {
    return apiClient.get(
      `/messages/conversations/${conversationId}/messages`,
      pagination
    );
  },

  /**
   * Send message
   * @param messageData - Message data
   * @returns Promise with sent message
   */
  sendMessage: (messageData: any): Promise<ApiResponse<any>> => {
    return apiClient.post('/messages/send', messageData);
  },

  /**
   * Mark messages as read
   * @param conversationId - Conversation ID
   * @param messageIds - Array of message IDs
   * @returns Promise with read status
   */
  markAsRead: (
    conversationId: string,
    messageIds?: string[]
  ): Promise<ApiResponse<any>> => {
    return apiClient.post('/messages/mark-read', {
      conversationId,
      messageIds,
    });
  },
};

// Payments API
export const paymentsApi = {
  /**
   * Create payment intent
   * @param paymentData - Payment data
   * @returns Promise with payment intent
   */
  createPaymentIntent: (paymentData: any): Promise<ApiResponse<any>> => {
    return apiClient.post('/payments/create-intent', paymentData);
  },

  /**
   * Confirm payment
   * @param paymentIntentId - Payment intent ID
   * @returns Promise with confirmation
   */
  confirmPayment: (paymentIntentId: string): Promise<ApiResponse<any>> => {
    return apiClient.post('/payments/confirm', { paymentIntentId });
  },
};

// Export default API client
export default apiClient;
export { apiClient };
