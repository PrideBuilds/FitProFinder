/**
 * Custom Hook TypeScript types
 * Types for React hooks and state management
 */

import type { ReactNode } from 'react';
import type { User, Trainer, Booking, Message, Conversation } from './index';

// Base Hook Types
export interface BaseHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

export interface BaseHookActions {
  refetch: () => void;
  reset: () => void;
}

// API Hooks
export interface UseApiState<T> extends BaseHookState<T> {
  isFetching: boolean;
  isRefetching: boolean;
  isStale: boolean;
}

export interface UseApiActions<T> extends BaseHookActions {
  mutate: (data: T) => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

// Authentication Hooks
export interface UseAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
}

// Search Hooks
export interface UseSearchState<T> {
  results: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface UseSearchActions<T> {
  search: (query: string, filters?: any) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
  setFilters: (filters: any) => void;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
}

// Pagination Hooks
export interface UsePaginationState {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  offset: number;
}

export interface UsePaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setLimit: (limit: number) => void;
}

// Form Hooks
export interface UseFormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

export interface UseFormActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
  validate: () => boolean;
  submit: (onSubmit: (data: T) => Promise<void>) => Promise<void>;
}

// Local Storage Hooks
export interface UseLocalStorageState<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  isLoaded: boolean;
}

// Session Storage Hooks
export interface UseSessionStorageState<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  isLoaded: boolean;
}

// Debounce Hooks
export interface UseDebounceState<T> {
  value: T;
  debouncedValue: T;
  isDebouncing: boolean;
}

export interface UseDebounceActions<T> {
  setValue: (value: T) => void;
  cancel: () => void;
}

// Throttle Hooks
export interface UseThrottleState<T> {
  value: T;
  throttledValue: T;
  isThrottling: boolean;
}

export interface UseThrottleActions<T> {
  setValue: (value: T) => void;
  cancel: () => void;
}

// Intersection Observer Hooks
export interface UseIntersectionObserverState {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export interface UseIntersectionObserverActions {
  disconnect: () => void;
  reconnect: () => void;
}

// Media Query Hooks
export interface UseMediaQueryState {
  matches: boolean;
  media: string;
}

// Geolocation Hooks
export interface UseGeolocationState {
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

export interface UseGeolocationActions {
  getCurrentPosition: () => void;
  watchPosition: () => void;
  clearWatch: () => void;
}

// WebSocket Hooks
export interface UseWebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Event | null;
  lastMessage: MessageEvent | null;
}

export interface UseWebSocketActions {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  sendObject: (data: any) => void;
}

// File Upload Hooks
export interface UseFileUploadState {
  files: File[];
  uploading: boolean;
  progress: Record<string, number>;
  errors: Record<string, string>;
  uploadedFiles: Array<{
    file: File;
    url: string;
    id: string;
  }>;
}

export interface UseFileUploadActions {
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  uploadFiles: () => Promise<void>;
  clearFiles: () => void;
  retryUpload: (fileId: string) => void;
}

// Modal Hooks
export interface UseModalState {
  isOpen: boolean;
  data: any;
}

export interface UseModalActions {
  open: (data?: any) => void;
  close: () => void;
  toggle: () => void;
}

// Toast Hooks
export interface UseToastState {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
  }>;
}

export interface UseToastActions {
  addToast: (toast: Omit<UseToastState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

// Theme Hooks
export interface UseThemeState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
}

export interface UseThemeActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

// Feature Flag Hooks
export interface UseFeatureFlagState {
  flags: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

export interface UseFeatureFlagActions {
  isEnabled: (flag: string) => boolean;
  refresh: () => void;
}

// Analytics Hooks
export interface UseAnalyticsState {
  isInitialized: boolean;
  userId: string | null;
  sessionId: string | null;
}

export interface UseAnalyticsActions {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  page: (name: string, properties?: Record<string, any>) => void;
  group: (groupId: string, traits?: Record<string, any>) => void;
  alias: (userId: string) => void;
  reset: () => void;
}

// Booking Hooks
export interface UseBookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  selectedBooking: Booking | null;
}

export interface UseBookingActions {
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: any) => Promise<void>;
  updateBooking: (id: string, bookingData: any) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  selectBooking: (booking: Booking | null) => void;
}

// Messaging Hooks
export interface UseMessagingState {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  typingUsers: string[];
  onlineUsers: string[];
}

export interface UseMessagingActions {
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  selectConversation: (conversation: Conversation) => void;
  createConversation: (participantId: string) => Promise<void>;
}

// Trainer Hooks
export interface UseTrainerState {
  trainers: Trainer[];
  selectedTrainer: Trainer | null;
  loading: boolean;
  error: string | null;
  filters: any;
}

export interface UseTrainerActions {
  fetchTrainers: (filters?: any) => Promise<void>;
  fetchTrainer: (id: string) => Promise<void>;
  selectTrainer: (trainer: Trainer | null) => void;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}
