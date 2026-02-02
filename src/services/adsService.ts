/**
 * Ads Service - Offline-First Ad Configuration
 *
 * Fetches ads from David's API with offline-first caching strategy:
 * - Loads from cache immediately (instant UX)
 * - Fetches fresh data in background when cache is stale
 * - Updates cache when new data arrives
 * - Works offline using last cached data
 * - Cross-platform: AsyncStorage (mobile) + localStorage (web)
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AdConfig,
  AdsSDKConfig,
  APIServiceConfig,
  ContentPayload,
} from '../types';

// Configuration - Defaults to davidjgrimsley.com, can be customized
let API_URL = 'https://davidjgrimsley.com/api/content';
let INTAKE_BASE_URL = 'https://davidjgrimsley.com';
const CACHE_KEY = 'dj_ads_cache';
const CACHE_TIMESTAMP_KEY = 'dj_ads_cache_timestamp';
let CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Initialize the Ads SDK with optional custom configuration.
 * If not called, defaults to davidjgrimsley.com URLs.
 * 
 * @example
 * ```typescript
 * initializeAdsSDK({
 *   apiUrl: process.env.EXPO_PUBLIC_ADS_API_URL,
 *   intakeBaseUrl: process.env.EXPO_PUBLIC_ADS_INTAKE_URL,
 * });
 * ```
 */
export function initializeAdsSDK(config?: AdsSDKConfig): void {
  if (config?.apiUrl) {
    // Light validation
    if (!config.apiUrl.startsWith('http://') && !config.apiUrl.startsWith('https://')) {
      console.warn('[AdsSDK] apiUrl should start with http:// or https://');
    }
    API_URL = config.apiUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  
  if (config?.intakeBaseUrl) {
    if (!config.intakeBaseUrl.startsWith('http://') && !config.intakeBaseUrl.startsWith('https://')) {
      console.warn('[AdsSDK] intakeBaseUrl should start with http:// or https://');
    }
    INTAKE_BASE_URL = config.intakeBaseUrl.replace(/\/$/, '');
  }
  
  if (config?.cacheDuration !== undefined) {
    if (config.cacheDuration < 0) {
      console.warn('[AdsSDK] cacheDuration should be positive');
    } else {
      CACHE_DURATION = config.cacheDuration;
    }
  }
}

// ===========================
// Storage Abstraction
// ===========================

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

// ===========================
// Transformation Logic
// ===========================

const iconMap: Record<string, string> = {
  'app-development': 'phone-portrait-outline',
  'website-building': 'globe-outline',
  'game-development': 'game-controller-outline',
  tutoring: 'school-outline',
  'online-presence': 'trending-up-outline',
};

const colorMap: Record<string, AdConfig['accentColor']> = {
  '#0E668B': 'blue',
  '#1E9E70': 'green',
  '#723B80': 'purple',
  '#EEA444': 'orange',
  '#D63C83': 'pink',
};

const fallbackAds: AdConfig[] = [
  {
    id: 'creative-strategy',
    title: 'Creative Strategy Sprint',
    tagline: 'Clarify your direction and ship faster.',
    description:
      'A focused 1:1 sprint to align your creative goals, audience, and execution plan. Perfect for creators launching a new project or pivoting into a new niche.',
    features: [
      'Roadmap for your next 90 days',
      'Positioning & audience alignment',
      'Content and distribution checklist',
    ],
    ctaText: 'Book a Strategy Sprint',
    ctaUrl: `${INTAKE_BASE_URL}/creative-strategy`,
    icon: 'sparkles',
    accentColor: 'purple',
  },
  {
    id: 'portfolio-review',
    title: 'Portfolio Review',
    tagline: 'Make your work stand out with clarity.',
    description:
      'Get targeted, practical feedback on your portfolio, project pages, and case studies. Walk away with fixes you can implement immediately.',
    features: [
      'Portfolio positioning feedback',
      'Case study structure & flow',
      'Actionable next steps',
    ],
    ctaText: 'Schedule a Review',
    ctaUrl: `${INTAKE_BASE_URL}/portfolio-review`,
    icon: 'layers',
    accentColor: 'blue',
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity Boost',
    tagline: 'A cohesive look that feels premium.',
    description:
      'Refresh your visuals and message with a lightweight brand identity package tailored to creative teams and indie studios.',
    features: [
      'Palette + typography direction',
      'Moodboard and brand voice',
      'Quick-start asset kit',
    ],
    ctaText: 'Explore Branding',
    ctaUrl: `${INTAKE_BASE_URL}/brand-identity`,
    icon: 'color-palette',
    accentColor: 'orange',
  },
  {
    id: 'launch-support',
    title: 'Launch Support',
    tagline: 'Build hype and land your first fans.',
    description:
      'From pre-launch planning to post-launch momentum, get a proven playbook and hands-on support for your next release.',
    features: [
      'Launch checklist & timeline',
      'Landing page feedback',
      'Post-launch growth plan',
    ],
    ctaText: 'Plan a Launch',
    ctaUrl: `${INTAKE_BASE_URL}/launch-support`,
    icon: 'rocket',
    accentColor: 'green',
  },
];

function transformService(service: APIServiceConfig): AdConfig {
  const accentColor = colorMap[service.accent] || 'blue';
  const icon = iconMap[service.id] || 'information-circle-outline';

  // Construct full URL from base + relative path
  const ctaUrl = `${INTAKE_BASE_URL}${service.intakeUrl}`;

  return {
    id: service.id,
    title: service.title,
    tagline: service.tagline,
    description: service.description,
    ctaText: service.primaryCtaLabel,
    ctaUrl,
    icon,
    accentColor,
    features: service.features ?? [],
  };
}

// ===========================
// Cache Management
// ===========================

async function getCachedAds(): Promise<AdConfig[] | null> {
  try {
    const cachedData = await storage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    return JSON.parse(cachedData) as AdConfig[];
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

async function setCachedAds(ads: AdConfig[]): Promise<void> {
  try {
    await storage.setItem(CACHE_KEY, JSON.stringify(ads));
    await storage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

async function isCacheExpired(): Promise<boolean> {
  try {
    const timestamp = await storage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return true;
    const age = Date.now() - parseInt(timestamp, 10);
    return age > CACHE_DURATION;
  } catch {
    return true;
  }
}

// ===========================
// API Fetching
// ===========================

async function fetchAdsFromAPI(): Promise<AdConfig[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const payload: ContentPayload = await response.json();

  return (payload.services ?? []).map(transformService);
}

// ===========================
// Public API - Offline-First
// ===========================

export async function getAllAds(): Promise<AdConfig[]> {
  const cachedAds = await getCachedAds();
  const cacheExpired = await isCacheExpired();

  if (cachedAds && !cacheExpired) {
    return cachedAds;
  }

  if (cachedAds && cacheExpired) {
    fetchAdsFromAPI()
      .then(setCachedAds)
      .catch((error) => console.error('Background refresh failed:', error));

    return cachedAds;
  }

  try {
    const freshAds = await fetchAdsFromAPI();
    await setCachedAds(freshAds);
    return freshAds.length ? freshAds : fallbackAds;
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return fallbackAds;
  }
}

export async function refreshAds(): Promise<AdConfig[]> {
  const freshAds = await fetchAdsFromAPI();
  await setCachedAds(freshAds);
  return freshAds;
}

export async function getRandomAd(): Promise<AdConfig | null> {
  const ads = await getAllAds();
  if (ads.length === 0) return null;
  return ads[Math.floor(Math.random() * ads.length)];
}

export async function getAdById(id: string): Promise<AdConfig | undefined> {
  const ads = await getAllAds();
  return ads.find((ad) => ad.id === id);
}

export async function clearAdsCache(): Promise<void> {
  await storage.removeItem(CACHE_KEY);
  await storage.removeItem(CACHE_TIMESTAMP_KEY);
}

export const trackAdEvent = (event: 'impression' | 'click', adId: string) => {
  console.log(`[Ads SDK] ${event}:`, adId);
};

export type { AdConfig };
