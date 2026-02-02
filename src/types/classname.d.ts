import 'react-native';
import 'expo-linear-gradient';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module 'expo-linear-gradient' {
  interface LinearGradientProps {
    className?: string;
  }
}
