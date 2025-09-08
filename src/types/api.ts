/**
 * API Response Types
 * Standardized response formats for all API endpoints
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  meta?: Record<string, any>;
}

// Error Response
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  field?: string; // For validation errors
}

// Pagination
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  offset?: number;
}

// Request/Response for common operations
export interface ListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Authentication
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'client' | 'trainer';
  phoneNumber?: string;
}

// Trainer Search
export interface TrainerSearchRequest extends ListRequest {
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number;
  };
  specialties?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  verified?: boolean;
  availability?: {
    date?: string;
    timeSlots?: string[];
  };
}

export interface TrainerSearchResponse {
  trainers: Trainer[];
  pagination: PaginationInfo;
  filters: {
    specialties: Specialty[];
    priceRanges: PriceRange[];
    locations: Location[];
  };
}

// Booking
export interface BookingRequest {
  trainerId: string;
  sessionTypeId: string;
  scheduledDate: string; // ISO string
  duration: number; // minutes
  notes?: string;
  meetingLink?: string;
  locationAddress?: string;
}

export interface BookingResponse {
  booking: Booking;
  paymentIntent?: {
    clientSecret: string;
    amount: number;
  };
}

// Messaging
export interface MessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  replyToMessageId?: string;
  attachments?: File[];
}

export interface ConversationRequest {
  participantId: string;
  title?: string;
}

// File Upload
export interface FileUploadRequest {
  file: File;
  type: 'profile' | 'message' | 'certification' | 'document';
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
}

// Admin
export interface AdminUserListRequest extends ListRequest {
  role?: 'client' | 'trainer' | 'admin';
  verified?: boolean;
  active?: boolean;
  search?: string;
}

export interface AdminStatsResponse {
  users: {
    total: number;
    clients: number;
    trainers: number;
    admins: number;
    verified: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
  };
  growth: {
    usersThisMonth: number;
    bookingsThisMonth: number;
    revenueThisMonth: number;
  };
}

// Import types from main types file
import type { User, Trainer, Booking, Specialty, Location } from './index';
