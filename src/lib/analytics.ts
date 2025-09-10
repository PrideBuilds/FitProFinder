/**
 * Analytics and observability setup
 * PostHog integration for tracking user events and errors
 */

import { env } from './env';

// PostHog configuration
const POSTHOG_KEY = env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

// Event types
export type AnalyticsEvent =
  | 'signup_completed'
  | 'profile_completed'
  | 'search_executed'
  | 'trainer_profile_view'
  | 'booking_intent'
  | 'booking_confirmed'
  | 'message_sent'
  | 'payment_succeeded'
  | 'invite_redeemed'
  | 'bug_report_submitted'
  | 'page_view'
  | 'error_occurred';

// Event properties interface
export interface EventProperties {
  [key: string]: any;
}

// Analytics class
class Analytics {
  private initialized = false;
  private posthog: any = null;

  async init() {
    if (this.initialized || !POSTHOG_KEY) {
      return;
    }

    try {
      // Dynamically import PostHog
      const { default: posthog } = await import('posthog-js');

      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        loaded: posthog => {
          this.posthog = posthog;
          this.initialized = true;
          console.log('Analytics initialized');
        },
      });
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async track(event: AnalyticsEvent, properties?: EventProperties) {
    if (!this.initialized || !this.posthog) {
      console.log('Analytics not initialized, skipping event:', event);
      return;
    }

    try {
      this.posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent:
          typeof window !== 'undefined' ? navigator.userAgent : undefined,
      });
    } catch (error) {
      console.error('Failed to track event:', event, error);
    }
  }

  async identify(userId: string, properties?: EventProperties) {
    if (!this.initialized || !this.posthog) {
      return;
    }

    try {
      this.posthog.identify(userId, properties);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  async setUserProperties(properties: EventProperties) {
    if (!this.initialized || !this.posthog) {
      return;
    }

    try {
      this.posthog.people.set(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  async reset() {
    if (!this.initialized || !this.posthog) {
      return;
    }

    try {
      this.posthog.reset();
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Initialize analytics on client side
if (typeof window !== 'undefined') {
  analytics.init();
}

// Helper functions for common events
export const trackEvent = (
  event: AnalyticsEvent,
  properties?: EventProperties
) => {
  analytics.track(event, properties);
};

export const trackPageView = (page: string, properties?: EventProperties) => {
  analytics.track('page_view', {
    page,
    ...properties,
  });
};

export const trackError = (error: Error, context?: EventProperties) => {
  analytics.track('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
    error_name: error.name,
    ...context,
  });
};

// Error boundary helper
export const setupErrorTracking = () => {
  if (typeof window === 'undefined') return;

  // Global error handler
  window.addEventListener('error', event => {
    trackError(event.error, {
      error_type: 'javascript_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', event => {
    trackError(new Error(event.reason), {
      error_type: 'unhandled_promise_rejection',
    });
  });
};

// Initialize error tracking
if (typeof window !== 'undefined') {
  setupErrorTracking();
}
