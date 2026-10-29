import * as Location from "expo-location";
import { useEffect } from "react";
import { Platform } from "react-native";
import { FALLBACK_LOCATION } from "@/constants";
import { useLocationStore } from "@/store/location.store";

const LOCATE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Location timed out")), ms)),
  ]);
}

const toPoint = ({ latitude, longitude }: Location.LocationObjectCoords) => ({ latitude, longitude });

/** Resolves the device location into the location store, falling back to FALLBACK_LOCATION. */
export function useDeviceLocation() {
  const setLocation = useLocationStore((s) => s.setLocation);

  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | undefined;

    async function locate() {
      try {
        // On web an unanswered permission prompt never settles, which would leave every venue list loading.
        const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), LOCATE_TIMEOUT_MS);
        if (status !== "granted") throw new Error("Location permission denied");

        const current = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          LOCATE_TIMEOUT_MS,
        );
        if (cancelled) return;
        setLocation(toPoint(current.coords), "granted");

        // The web shim's watch/remove cycle is unreliable, so continuous tracking is native-only.
        if (Platform.OS === "web") return;
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 100, timeInterval: 30_000 },
          (update) => setLocation(toPoint(update.coords), "granted"),
        );
        if (cancelled) subscription.remove();
      } catch {
        if (!cancelled) setLocation(FALLBACK_LOCATION, "fallback");
      }
    }

    locate();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [setLocation]);
}
