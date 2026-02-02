# @mr.dj2u/ads-sdk

Offline-first ads service and components for React Native/Expo apps. Display tasteful, non-intrusive ads for your services with built-in caching, analytics tracking, and customizable styling.

**Needs External API** You will need to set up an API like I have in my portfolio repo: [DavidsPortfolio](../../DavidsPortfolio)
  
**Out-of-the-box ready:** Works immediately with my portfolio services as a default so you can see it working right away but you will want to see the section below for initializing to your data.

## Features

- 🎨 **Minimal Design** - Blends seamlessly with your app's aesthetic
- 📱 **Cross-Platform** - iOS, Android, and Web support
- 💾 **Offline-First** - Caches ads locally with background refresh
- 🎯 **Smart Defaults** - Works without configuration (uses davidjgrimsley.com)
- 🔧 **Fully Customizable** - Override URLs and components per project
- 📊 **Analytics Ready** - Built-in impression and click tracking
- 🎭 **Uniwind/NativeWind Support** - Use Tailwind className for styling

## Installation

```bash
npm install @davidjgrimsley/ads-sdk
```

### Peer Dependencies

Ensure you have these installed:

```bash
npx expo install @react-native-async-storage/async-storage @expo/vector-icons expo-linking expo-linear-gradient
```

## Quick Start

### Basic Usage (No Configuration Required)

The SDK works out-of-the-box with default URLs pointing to davidjgrimsley.com:

```tsx
import { AdBannerWithModal } from '@davidjgrimsley/ads-sdk';

export default function HomeScreen() {
  return (
    <View>
      <Text>Welcome to my app!</Text>
      <AdBannerWithModal className="mx-4 my-2" />
    </View>
  );
}
```

### Optional Configuration

To use your own API and intake URLs, call `initializeAdsSDK()` once at app startup:

```tsx
// app/_layout.tsx or app/index.tsx
import { initializeAdsSDK } from '@davidjgrimsley/ads-sdk';

// Using environment variables (recommended)
initializeAdsSDK({
  apiUrl: process.env.EXPO_PUBLIC_ADS_API_URL,
  intakeBaseUrl: process.env.EXPO_PUBLIC_ADS_INTAKE_URL,
  cacheDuration: 1000 * 60 * 60, // Optional: 1 hour (default)
});

// Or hardcode directly
initializeAdsSDK({
  apiUrl: 'https://yoursite.com/api/content',
  intakeBaseUrl: 'https://yoursite.com',
});
```

**Environment Variables Example (`.env`):**

```env
EXPO_PUBLIC_ADS_API_URL=https://yoursite.com/api/content
EXPO_PUBLIC_ADS_INTAKE_URL=https://yoursite.com
```

> **Note:** If you don't call `initializeAdsSDK()`, the SDK defaults to davidjgrimsley.com URLs. This gives you free exposure while keeping your app functional!

## Usage in Feed/Scrollable Lists

Display ads every 15-20 items in your FlatList or ScrollView:

```tsx
import { FlatList } from 'react-native';
import { AdBannerWithModal } from '@davidjgrimsley/ads-sdk';

export default function FeedScreen() {
  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    // Show ad every 15 items
    if (index > 0 && index % 15 === 0) {
      return <AdBannerWithModal className="mx-4 my-2" />;
    }
    
    return <PostCard post={item} />;
  };

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item, index) => 
        item.id || `ad-${Math.floor(index / 15)}`
      }
    />
  );
}
```

**For ScrollView with mixed content:**

```tsx
<ScrollView>
  {posts.map((post, index) => (
    <React.Fragment key={post.id}>
      <PostCard post={post} />
      {/* Ad every 20 posts */}
      {(index + 1) % 20 === 0 && (
        <AdBannerWithModal className="mx-4 my-4" />
      )}
    </React.Fragment>
  ))}
</ScrollView>
```

## Components

### AdBannerWithModal

Complete solution with banner, detail modal, and info modal.

```tsx
<AdBannerWithModal 
  className="mx-4 my-2"
  adId="web-design" // Optional: show specific ad
/>
```

**Props:**
- `className?: string` - NativeWind/Tailwind classes
- `adId?: string` - Show specific ad instead of random rotation
- `BannerComponent?: React.ComponentType<AdBannerProps>` - Custom banner component
- `ModalComponent?: React.ComponentType<AdModalProps>` - Custom modal component

### Individual Components

Use components separately for custom layouts:

```tsx
import { AdBanner, AdModal, AdInfoModal } from '@davidjgrimsley/ads-sdk';

function CustomAdLayout() {
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getRandomAd().then(setAd);
  }, []);

  return (
    <>
      <AdBanner 
        ad={ad} 
        onPress={() => setModalVisible(true)}
      />
      <AdModal 
        visible={modalVisible} 
        ad={ad}
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}
```

## Service API

Access ads data directly for custom implementations:

```typescript
import { 
  getAllAds, 
  getRandomAd, 
  getAdById, 
  refreshAds,
  clearAdsCache,
  trackAdEvent 
} from '@davidjgrimsley/ads-sdk';

// Fetch all cached ads
const ads = await getAllAds();

// Get random ad for rotation
const randomAd = await getRandomAd();

// Get specific ad
const ad = await getAdById('web-design');

// Force refresh from API
await refreshAds();

// Clear cache
await clearAdsCache();

// Track analytics
await trackAdEvent('impression', adId);
await trackAdEvent('click', adId);
```

## Advanced Customization

### Custom Banner Component

```tsx
import { 
  AdBannerWithModal, 
  type AdBannerProps 
} from '@davidjgrimsley/ads-sdk';

function MyCustomBanner({ ad, onPress, onDismiss }: AdBannerProps) {
  return (
    <Pressable onPress={onPress} className="bg-purple-600 p-4 rounded-lg">
      <Text className="text-white font-bold">{ad.title}</Text>
      <Text className="text-purple-200">{ad.tagline}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Text className="text-white">✕</Text>
      </TouchableOpacity>
    </Pressable>
  );
}

// Use your custom banner
<AdBannerWithModal BannerComponent={MyCustomBanner} />
```

### Custom Modal Component

```tsx
import { type AdModalProps } from '@davidjgrimsley/ads-sdk';

function MyCustomModal({ visible, ad, onClose }: AdModalProps) {
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Your custom modal design */}
    </Modal>
  );
}

<AdBannerWithModal ModalComponent={MyCustomModal} />
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type { 
  AdConfig, 
  AdsSDKConfig,
  AdBannerProps,
  AdModalProps,
  AdBannerWithModalProps 
} from '@davidjgrimsley/ads-sdk';
```

## API Response Format

Your API endpoint should return this structure:

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-02T12:00:00Z",
  "services": [
    {
      "id": "web-design",
      "title": "Web Design",
      "tagline": "Beautiful, responsive websites",
      "description": "Full description...",
      "ctaText": "Get Started",
      "intakeUrl": "/services/web-design",
      "icon": "💻",
      "accentColor": "blue",
      "features": ["Feature 1", "Feature 2"]
    }
  ]
}
```

## License

MIT © David J Grimsley
