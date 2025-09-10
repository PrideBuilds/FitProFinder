/**
 * Feature flags system
 * Simple read-through cache for feature flags stored in database
 */

import { env } from './env';

// Feature flag types
export interface FeatureFlags {
  beta_gate: boolean;
  messaging_enabled: boolean;
  payments_enabled: boolean;
  reviews_enabled: boolean;
  analytics_enabled: boolean;
  maintenance_mode: boolean;
}

// Default feature flags
const DEFAULT_FLAGS: FeatureFlags = {
  beta_gate: env.ENABLE_BETA_GATE ?? false,
  messaging_enabled: true,
  payments_enabled: true,
  reviews_enabled: true,
  analytics_enabled: true,
  maintenance_mode: false,
};

// In-memory cache for feature flags
let flagsCache: FeatureFlags | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get feature flags with caching
 * In a real implementation, this would fetch from the database
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const now = Date.now();

  // Return cached flags if still valid
  if (flagsCache && now < cacheExpiry) {
    return flagsCache;
  }

  try {
    // TODO: Replace with actual database query
    // const flags = await db.select().from(featureFlagsTable);
    // flagsCache = mergeFlags(DEFAULT_FLAGS, flags);

    // For now, return default flags
    flagsCache = { ...DEFAULT_FLAGS };
    cacheExpiry = now + CACHE_DURATION;

    return flagsCache;
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
    // Return default flags on error
    return DEFAULT_FLAGS;
  }
}

/**
 * Get a specific feature flag
 */
export async function getFeatureFlag(
  flag: keyof FeatureFlags
): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[flag];
}

/**
 * Check if beta gate is enabled
 */
export async function isBetaGateEnabled(): Promise<boolean> {
  return await getFeatureFlag('beta_gate');
}

/**
 * Check if messaging is enabled
 */
export async function isMessagingEnabled(): Promise<boolean> {
  return await getFeatureFlag('messaging_enabled');
}

/**
 * Check if payments are enabled
 */
export async function isPaymentsEnabled(): Promise<boolean> {
  return await getFeatureFlag('payments_enabled');
}

/**
 * Check if reviews are enabled
 */
export async function isReviewsEnabled(): Promise<boolean> {
  return await getFeatureFlag('reviews_enabled');
}

/**
 * Check if analytics are enabled
 */
export async function isAnalyticsEnabled(): Promise<boolean> {
  return await getFeatureFlag('analytics_enabled');
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
  return await getFeatureFlag('maintenance_mode');
}

/**
 * Clear the feature flags cache
 * Useful for testing or when flags are updated
 */
export function clearFlagsCache(): void {
  flagsCache = null;
  cacheExpiry = 0;
}

/**
 * Merge database flags with default flags
 * Database flags override default flags
 */
function mergeFlags(defaultFlags: FeatureFlags, dbFlags: any[]): FeatureFlags {
  const merged = { ...defaultFlags };

  dbFlags.forEach(flag => {
    if (flag.key in merged) {
      merged[flag.key as keyof FeatureFlags] = flag.value;
    }
  });

  return merged;
}
