export interface AdConfig {
  id: string;
  title: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  icon: string;
  accentColor: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  features?: string[];
}

/**
 * Configuration options for the Ads SDK.
 * All fields are optional - defaults to davidjgrimsley.com
 */
export interface AdsSDKConfig {
  /** API URL to fetch ads from. Defaults to https://davidjgrimsley.com/api/content */
  apiUrl?: string;
  /** Base URL for intake/CTA links. Defaults to https://davidjgrimsley.com */
  intakeBaseUrl?: string;
  /** Cache duration in milliseconds. Defaults to 1 hour (3600000ms) */
  cacheDuration?: number;
}

export interface APIServiceConfig {
  id: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  primaryCtaLabel: string;
  primaryCtaId: string;
  intakeUrl: string;
  accent: string;
}

export interface ContentPayload {
  version: string;
  generatedAt: string;
  services: APIServiceConfig[];
}
