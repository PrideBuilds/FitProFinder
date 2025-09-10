/**
 * Form-specific TypeScript types
 * Types for form validation, submission, and state management
 */

import type { User, Trainer, Booking, Location } from './index';

// Base Form Types
export interface BaseFormData {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Validation Rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationRule[];
}

// Authentication Forms
export interface LoginFormData extends BaseFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData extends BaseFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'trainer';
  phoneNumber: string;
  termsAccepted: boolean;
  marketingEmails: boolean;
}

export interface ForgotPasswordFormData extends BaseFormData {
  email: string;
}

export interface ResetPasswordFormData extends BaseFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// User Profile Forms
export interface UserProfileFormData extends BaseFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: File;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export interface TrainerProfileFormData extends BaseFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  bio: string;

  // Location
  location: LocationFormData;

  // Professional Info
  specialties: string[];
  experienceYears: number;
  certifications: CertificationFormData[];

  // Pricing
  hourlyRate: number;
  sessionTypes: SessionTypeFormData[];

  // Availability
  availability: AvailabilityFormData[];

  // Social Links
  socialLinks: SocialLinksFormData;

  // Preferences
  offersOnline: boolean;
  offersInPerson: boolean;
  maxTravelDistance: number;
  timezone: string;

  // Images
  profileImage?: File;
  galleryImages?: File[];
}

export interface LocationFormData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CertificationFormData {
  name: string;
  organization: string;
  dateObtained: string;
  expiryDate?: string;
  credentialId?: string;
  certificateFile?: File;
}

export interface SessionTypeFormData {
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  isOnline: boolean;
  isInPerson: boolean;
  maxParticipants: number;
}

export interface AvailabilityFormData {
  dayOfWeek: number; // 0-6
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isRecurring: boolean;
  specificDate?: string; // for one-time availability
}

export interface SocialLinksFormData {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  youtube?: string;
  tiktok?: string;
}

// Search Forms
export interface TrainerSearchFormData extends BaseFormData {
  location: {
    city: string;
    state: string;
    zipCode: string;
    radius: number;
  };
  specialties: string[];
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  verified: boolean;
  availability: {
    date?: string;
    timeSlots: string[];
  };
  sortBy: 'rating' | 'price' | 'experience' | 'reviews' | 'distance';
  sortOrder: 'asc' | 'desc';
}

// Booking Forms
export interface BookingFormData extends BaseFormData {
  trainerId: string;
  sessionTypeId: string;
  scheduledDate: string; // ISO string
  scheduledTime: string; // "14:30"
  duration: number; // minutes
  notes: string;
  meetingLink?: string;
  locationAddress?: string;
  isOnline: boolean;
  isInPerson: boolean;
}

export interface BookingRescheduleFormData extends BaseFormData {
  bookingId: string;
  newDate: string;
  newTime: string;
  reason: string;
}

// Payment Forms
export interface PaymentFormData extends BaseFormData {
  amount: number;
  currency: string;
  paymentMethodId: string;
  billingAddress: BillingAddressFormData;
  savePaymentMethod: boolean;
}

export interface BillingAddressFormData {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

// Review Forms
export interface ReviewFormData extends BaseFormData {
  bookingId: string;
  trainerId: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  categories: {
    communication: number;
    punctuality: number;
    knowledge: number;
    effectiveness: number;
  };
}

// Message Forms
export interface MessageFormData extends BaseFormData {
  conversationId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  replyToMessageId?: string;
  attachments: File[];
}

// Admin Forms
export interface AdminUserFormData extends BaseFormData {
  userId: string;
  role: 'client' | 'trainer' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  adminLevel?: number;
  notes: string;
}

export interface AdminSettingsFormData extends BaseFormData {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: LocationFormData;
  socialLinks: SocialLinksFormData;
  features: {
    enableMessaging: boolean;
    enablePayments: boolean;
    enableReviews: boolean;
    enableOnlineSessions: boolean;
    requireVerification: boolean;
  };
  pricing: {
    platformFeePercentage: number;
    stripeFeePercentage: number;
    minimumPayout: number;
  };
}

// Form State Management
export interface FormState<T> {
  data: T;
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isPristine: boolean;
}

export interface FormActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
  validate: () => boolean;
  submit: () => Promise<void>;
}

// Form Validation
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Form Submission
export interface FormSubmissionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// Multi-step Forms
export interface MultiStepFormData<T> extends BaseFormData {
  currentStep: number;
  totalSteps: number;
  stepData: T[];
  completedSteps: number[];
}

export interface MultiStepFormActions<T> {
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateStepData: (step: number, data: T) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isStepComplete: (step: number) => boolean;
}
