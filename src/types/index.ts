// Core User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'trainer' | 'admin';
  profileImageUrl?: string;
  profileImage?: string;
  phoneNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client extends User {
  role: 'client';
  preferences?: {
    fitnessGoals: string[];
    preferredLocation?: string;
    budget?: {
      min: number;
      max: number;
    };
  };
}

export interface Trainer extends User {
  role: 'trainer';
  businessName?: string;
  specialties: string[];
  bio: string;
  experienceYears: number; // years
  certifications?: Certification[];
  location: Location;
  pricing?: PricingInfo;
  availability?: Availability[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  subscription?: SubscriptionTier;
  socialLinks?: SocialLinks;
  subscriptionTier?: string;
  isAcceptingClients?: boolean;
  offersOnline?: boolean;
  offersInPerson?: boolean;
}

// Location & Geography
export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: 'US';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Pricing & Subscriptions
export interface PricingInfo {
  sessionTypes: SessionType[];
  packages?: Package[];
}

export interface SessionType {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description?: string;
}

export interface Package {
  id: string;
  name: string;
  sessionCount: number;
  price: number;
  validityDays: number;
  description?: string;
}

export interface SubscriptionTier {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  features: string[];
  monthlyCost: number;
  maxListings: number;
  hasBadge: boolean;
  hasAnalytics: boolean;
}

// Bookings & Scheduling
export interface Booking {
  id: string;
  clientId: string;
  trainerId: string;
  sessionType: SessionType;
  dateTime: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentIntentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isAvailable: boolean;
}

// Reviews & Ratings
export interface Review {
  id: string;
  clientId: string;
  trainerId: string;
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
  isPublic: boolean;
  createdAt: Date;
}

// Messaging & Communication
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  content: string;
  metadata?: Record<string, any>;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  replyToMessageId?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  sender?: User;
  receiver?: User;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailUrl?: string;
  uploadStatus: 'uploading' | 'completed' | 'failed';
  uploadError?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  clientId: string;
  trainerId: string;
  title?: string;
  status: 'active' | 'archived' | 'blocked';
  lastMessagePreview?: string;
  lastMessageAt?: Date;
  totalMessages: number;
  clientUnreadCount: number;
  trainerUnreadCount: number;
  unreadCount?: number; // Current user's unread count
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  client?: User;
  trainer?: User;
  lastMessage?: Message;
  participant?: User; // The other user in the conversation (not current user)
}

export interface ConversationStats {
  totalMessages: number;
  totalFiles: number;
  firstMessageAt?: Date;
  lastActivityAt?: Date;
  messagesByType: Record<string, number>;
}

// Real-time messaging types
export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

// Socket event types
export interface SocketEvents {
  // Message events
  send_message: (data: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToMessageId?: string;
  }) => void;
  message_sent: (message: Message) => void;
  new_message: (message: Message) => void;

  // Typing events
  typing_start: (data: { conversationId: string }) => void;
  typing_stop: (data: { conversationId: string }) => void;
  user_typing: (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }) => void;

  // Read status events
  mark_messages_read: (data: {
    conversationId: string;
    messageIds?: string[];
  }) => void;
  messages_read: (data: {
    conversationId: string;
    messageIds: string[];
    readBy: string;
  }) => void;

  // Conversation events
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  conversation_joined: (conversationId: string) => void;
  conversation_left: (conversationId: string) => void;

  // Online status events
  user_online: (data: { userId: string; isOnline: boolean }) => void;
  get_conversation_online_users: (conversationId: string) => void;
  conversation_online_users: (data: {
    conversationId: string;
    onlineUsers: string[];
  }) => void;

  // Connection events
  connect: () => void;
  disconnect: () => void;
  error: (error: any) => void;
}

// API request/response types for messaging
export interface CreateConversationRequest {
  participantId: string; // The other user's ID (client or trainer)
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  replyToMessageId?: string;
  attachments?: File[];
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface SearchMessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Search & Filtering
export interface SearchFilters {
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number; // miles
  };
  city?: string;
  state?: string;
  specialties?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availability?: {
    date?: Date;
    timeSlots?: string[];
  };
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'reviews' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  trainers: Trainer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Additional Supporting Types
export interface Certification {
  name: string;
  organization: string;
  dateObtained: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

// Form Types
export interface TrainerSignupForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  phoneNumber: string;
  specialties: string[];
  bio: string;
  experienceYears: number;
  location: Omit<Location, 'coordinates'>;
  pricing?: PricingInfo;
}

export interface ClientSignupForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface BookingForm {
  trainerId: string;
  sessionTypeId: string;
  date: string;
  time: string;
  notes?: string;
}

// Re-export all types from other files
export * from './api';
export * from './components';
export * from './forms';
export * from './hooks';
export * from './utils';
