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
  backgroundColor: "#0B0C10",
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
      backgroundColor: "#0B0C10",
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
    "expo-status-bar",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        // The wordmark is ~5.6:1, so 240 wide sits about 43 tall: present without crowding the screen.
        imageWidth: 240,
        resizeMode: "contain",
        backgroundColor: "#0B0C10",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      // The "Endorphix" project on expo.dev, which EAS builds and updates attach to.
      projectId: "c254dd26-7fa1-4151-9e75-350f9f1fd276",
    },
  },
});
