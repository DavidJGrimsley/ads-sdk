/**
 * @davidjgrimsley/ads-sdk
 * Offline-first ads service and components for David J Grimsley's portfolio services
 */

export { default as AdBanner } from './components/AdBanner';
export { default as AdBannerWithModal } from './components/AdBannerWithModal';
export { default as AdModal } from './components/AdModal';
export { default as AdInfoModal } from './components/AdInfoModal';

export {
  getAllAds,
  refreshAds,
  getRandomAd,
  getAdById,
  clearAdsCache,
  trackAdEvent,
  initializeAdsSDK,
} from './services/adsService';

export type { AdConfig, AdsSDKConfig } from './types';
export type { AdBannerProps } from './components/AdBanner';
export type { AdModalProps } from './components/AdModal';
export type { AdBannerWithModalProps } from './components/AdBannerWithModal';
