/**
 * Component-specific TypeScript types
 * Types for React components, props, and UI elements
 */

import type { ReactNode } from 'react';

// Base Component Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Button Component
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  href?: string;
  target?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

// Input Component
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

// Modal Component
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  overlay?: boolean;
  animation?: 'fade' | 'slide' | 'zoom';
}

// Card Component
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Loading States
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  overlay?: boolean;
  spinner?: boolean;
  skeleton?: boolean;
}

// Error States
export interface ErrorProps extends BaseComponentProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  variant?: 'error' | 'warning' | 'info';
}

// Empty States
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
}

// Form Components
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, any>) => void;
  onReset?: () => void;
  loading?: boolean;
  disabled?: boolean;
  validation?: Record<string, any>;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  validation?: Record<string, any>;
}

// Search Components
export interface SearchInputProps extends InputProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  debounceMs?: number;
  minLength?: number;
}

export interface FilterProps extends BaseComponentProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
  collapsible?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'checkbox' | 'radio';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

// List Components
export interface ListProps<T> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  pagination?: PaginationProps;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
}

// Trainer Components
export interface TrainerCardProps extends BaseComponentProps {
  trainer: Trainer;
  onBook?: (trainer: Trainer) => void;
  onViewProfile?: (trainer: Trainer) => void;
  onMessage?: (trainer: Trainer) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface TrainerProfileProps extends BaseComponentProps {
  trainer: Trainer;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onBook?: () => void;
  onMessage?: () => void;
}

// Booking Components
export interface BookingFormProps extends FormProps {
  trainer: Trainer;
  sessionTypes: SessionType[];
  onSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
}

export interface BookingCardProps extends BaseComponentProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
  onReschedule?: (booking: Booking) => void;
  onViewDetails?: (booking: Booking) => void;
  showActions?: boolean;
}

// Message Components
export interface MessageBubbleProps extends BaseComponentProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

export interface ConversationListProps extends BaseComponentProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  loading?: boolean;
}

export interface MessageListProps extends BaseComponentProps {
  messages: Message[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  typingUsers?: string[];
}

// Chat Components
export interface ChatInputProps extends BaseComponentProps {
  onSendMessage: (content: string, type?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showEmojiPicker?: boolean;
  showFileUpload?: boolean;
  onFileUpload?: (file: File) => void;
}

export interface ChatHeaderProps extends BaseComponentProps {
  user: User;
  isOnline?: boolean;
  lastSeen?: Date;
  onCall?: () => void;
  onVideoCall?: () => void;
  onInfo?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
}

// Import types from main types file
import type { 
  User, 
  Trainer, 
  Booking, 
  Message, 
  Conversation, 
  SessionType 
} from './index';
