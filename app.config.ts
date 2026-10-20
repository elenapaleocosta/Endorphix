import { type ExpoConfig, type ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "endorphix",
  slug: "endorphix",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "endorphix",
  userInterfaceStyle: "dark",
  backgroundColor: "#0A0A0F",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0A0A0F",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.endorphix.app",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Endorphix uses your location to discover elite facilities within 50km.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Endorphix uses your location to log activity and track momentum.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#0A0A0F",
    },
    package: "com.endorphix.app",
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "VIBRATE",
    ],
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-location",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0A0A0F",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
    eas: {
      projectId: "YOUR_EAS_PROJECT_ID",
    },
  },
});
