import { type ExpoConfig, type ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "endorphix",
  slug: "endorphix",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "endorphix",
  userInterfaceStyle: "light",
  backgroundColor: "#EDEBE6",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#EDEBE6",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.endorphix.app",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "endorphix uses your location to discover elite athletic facilities within a 50km radius.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "endorphix uses your location to log somatic activity and track consecutive momentum.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#EDEBE6",
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
        backgroundColor: "#EDEBE6",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "your-eas-project-id",
    },
  },
});
