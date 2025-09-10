/**
 * Utility TypeScript types
 * Common utility types used throughout the application
 */

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Array utility types
export type NonEmptyArray<T> = [T, ...T[]];
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Object utility types
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ValuesOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? T[K] : never;
}[keyof T];

// Function utility types
export type AsyncFunction<T = any, R = any> = (...args: T[]) => Promise<R>;
export type SyncFunction<T = any, R = any> = (...args: T[]) => R;
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeEventHandler<T = HTMLInputElement> = (
  event: React.ChangeEvent<T>
) => void;
export type ClickEventHandler<T = HTMLButtonElement> = (
  event: React.MouseEvent<T>
) => void;
export type SubmitEventHandler<T = HTMLFormElement> = (
  event: React.FormEvent<T>
) => void;
export type FocusEventHandler<T = HTMLElement> = (
  event: React.FocusEvent<T>
) => void;
export type KeyboardEventHandler<T = HTMLElement> = (
  event: React.KeyboardEvent<T>
) => void;

// API utility types
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';
export type HttpStatus =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 500
  | 502
  | 503;

export type ApiEndpoint = string;
export type ApiParams = Record<string, string | number | boolean | undefined>;
export type ApiHeaders = Record<string, string>;

// Form utility types
export type FormFieldName = string;
export type FormFieldValue =
  | string
  | number
  | boolean
  | File
  | File[]
  | null
  | undefined;
export type FormFieldError = string | null | undefined;
export type FormFieldTouched = boolean;

export type FormData = Record<FormFieldName, FormFieldValue>;
export type FormErrors = Record<FormFieldName, FormFieldError>;
export type FormTouched = Record<FormFieldName, FormFieldTouched>;

// Validation utility types
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
  message?: string;
};

export type ValidationSchema = Record<
  string,
  ValidationRule | ValidationRule[]
>;
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

// State management utility types
export type StateUpdater<T> = (prevState: T) => T;
export type StateSetter<T> = (value: T | StateUpdater<T>) => void;

export type ReducerAction<T = any> = {
  type: string;
  payload?: T;
};

export type Reducer<T, A extends ReducerAction> = (state: T, action: A) => T;

// Component utility types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type ComponentPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type ComponentProps<T = any> = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
} & T;

// Layout utility types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Spacing =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64;
export type Color =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'gray';

// Animation utility types
export type AnimationDuration = 'fast' | 'normal' | 'slow';
export type AnimationEasing =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear';
export type AnimationDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse';

// Date and time utility types
export type DateFormat = 'short' | 'medium' | 'long' | 'full';
export type TimeFormat = '12h' | '24h';
export type Timezone = string;

// File utility types
export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'other';
export type FileSize = number; // in bytes
export type FileExtension = string; // without the dot

export type FileUploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';
export type FileUploadProgress = number; // 0-100

// URL utility types
export type URLProtocol = 'http' | 'https' | 'ftp' | 'file' | 'data';
export type URLSearchParams = Record<string, string | string[]>;

// Localization utility types
export type Locale = string; // e.g., 'en-US', 'es-ES'
export type Currency = string; // e.g., 'USD', 'EUR'
export type Language = string; // e.g., 'en', 'es'

// Theme utility types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'primary' | 'secondary' | 'accent' | 'neutral';
export type ThemeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Permission utility types
export type Permission = string;
export type Role = string;
export type Resource = string;
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Error utility types
export type ErrorCode = string;
export type ErrorMessage = string;
export type ErrorDetails = Record<string, any>;

export type AppError = {
  code: ErrorCode;
  message: ErrorMessage;
  details?: ErrorDetails;
  stack?: string;
  timestamp: Date;
};

// Feature flag utility types
export type FeatureFlag = string;
export type FeatureFlagValue = boolean | string | number;
export type FeatureFlags = Record<FeatureFlag, FeatureFlagValue>;

// Analytics utility types
export type AnalyticsEvent = string;
export type AnalyticsProperties = Record<string, any>;
export type AnalyticsUserId = string;
export type AnalyticsSessionId = string;

// Cache utility types
export type CacheKey = string;
export type CacheValue = any;
export type CacheTTL = number; // in seconds
export type CacheStrategy =
  | 'memory'
  | 'localStorage'
  | 'sessionStorage'
  | 'indexedDB';

// Database utility types
export type DatabaseId = string | number;
export type DatabaseQuery = Record<string, any>;
export type DatabaseSort = Record<string, 'asc' | 'desc'>;
export type DatabaseFilter = Record<string, any>;

// Pagination utility types
export type PageNumber = number;
export type PageSize = number;
export type TotalCount = number;
export type HasNextPage = boolean;
export type HasPrevPage = boolean;

// Search utility types
export type SearchQuery = string;
export type SearchFilters = Record<string, any>;
export type SearchSort = Record<string, 'asc' | 'desc'>;
export type SearchResult<T> = {
  items: T[];
  totalCount: number;
  hasMore: boolean;
};

// Real-time utility types
export type EventName = string;
export type EventData = any;
export type EventCallback = (data: EventData) => void;
export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

// WebSocket utility types
export type WebSocketMessage = {
  type: string;
  data: any;
  timestamp: Date;
};

// Notification utility types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  position?: NotificationPosition;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
};

// Modal utility types
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

// Toast utility types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

// Loading utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type LoadingType = 'spinner' | 'skeleton' | 'dots' | 'pulse';

// Status utility types
export type Status = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Configuration utility types
export type ConfigValue = string | number | boolean | object | null | undefined;
export type ConfigSchema = Record<
  string,
  {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    default?: any;
    validation?: ValidationRule;
  }
>;

// Environment utility types
export type Environment = 'development' | 'staging' | 'production' | 'test';
export type EnvironmentVariable = string;

// Logging utility types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogContext = Record<string, any>;

// Performance utility types
export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
};

// Security utility types
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';
export type SecurityThreat =
  | 'xss'
  | 'csrf'
  | 'injection'
  | 'unauthorized'
  | 'data-leak';

// Accessibility utility types
export type AriaRole = string;
export type AriaState = Record<string, boolean | string | number>;
export type AriaProperty = Record<string, string | number>;

// Internationalization utility types
export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;
export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
