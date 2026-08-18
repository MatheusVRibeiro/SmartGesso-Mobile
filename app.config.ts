import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'SmartGesso',
  slug: 'smartgesso',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'smartgesso',
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.smartgesso.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-image', 'expo-sharing'],
  extra: {
    eas: {
      projectId: 'smartgesso',
    },
  },
};

export default config;
