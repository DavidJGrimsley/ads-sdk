import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { getAdById, getRandomAd, trackAdEvent } from '../services/adsService';
import type { AdConfig } from '../types';
import AdBanner, { type AdBannerProps } from './AdBanner';
import AdModal, { type AdModalProps } from './AdModal';
import AdInfoModal from './AdInfoModal';

export interface AdBannerWithModalProps {
  /** Optional: Provide specific ad ID instead of random rotation */
  adId?: string;
  
  /** Optional: Custom className for container */
  className?: string;
  
  /** Optional: Custom banner component to replace default AdBanner */
  BannerComponent?: React.ComponentType<AdBannerProps>;
  
  /** Optional: Custom modal component to replace default AdModal */
  ModalComponent?: React.ComponentType<AdModalProps>;
}

/**
 * AdBannerWithModal Component
 * 
 * Combines AdBanner, AdModal, and AdInfoModal with state management.
 * Shows a random ad banner that opens a modal with details when pressed.
 * Content rotates on each render to show different services.
 * Supports dismissal with shrink animation.
 */
export default function AdBannerWithModal({ 
  adId, 
  className,
  BannerComponent,
  ModalComponent,
}: AdBannerWithModalProps) {
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;
  
  // Use custom components or defaults
  const Banner = BannerComponent ?? AdBanner;
  const Modal = ModalComponent ?? AdModal;

  useEffect(() => {
    let mounted = true;

    const loadAd = async () => {
      try {
        if (adId) {
          const specificAd = await getAdById(adId);
          if (!mounted) return;
          if (specificAd) {
            setAd(specificAd);
            return;
          }
        }

        const randomAd = await getRandomAd();
        if (!mounted) return;
        setAd(randomAd);
      } catch (error) {
        if (!mounted) return;
        console.warn('Ad load fallback:', error);
        setAd(null);
      }
    };

    loadAd();

    return () => {
      mounted = false;
    };
  }, [adId]);

  useEffect(() => {
    if (ad) {
      trackAdEvent('impression', ad.id);
    }
  }, [ad]);

  const handleDismiss = () => {
    // Animate out
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
    });
  };

  if (!ad || dismissed) {
    return null;
  }

  return (
    <>
      <Banner 
        ad={ad} 
        className={className}
        onPress={() => {
          trackAdEvent('click', ad.id);
          setModalVisible(true);
        }}
        onInfoPress={() => setInfoModalVisible(true)}
        onDismiss={handleDismiss}
        animatedValue={animatedValue}
      />
      
      <Modal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        ad={ad}
      />

      <AdInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
    </>
  );
}
