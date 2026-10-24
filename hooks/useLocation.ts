import * as Location from "expo-location";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useLocationStore } from "@/store/location.store";
import { useHaptics } from "@/hooks/useHaptics";

export function useLocation() {
  const { setUserLocation, setLocationPermission, setLoadingLocation } =
    useLocationStore();
  const { tap } = useHaptics();

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function init() {
      setLoadingLocation(true);

      // On Web, expo-location watchPosition / removeSubscription has known shim quirks
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && "permissions" in navigator && (navigator as any).permissions?.query) {
          try {
            const perm = await (navigator as any).permissions.query({ name: "geolocation" });
            if (perm && perm.state === "denied") {
              if (!isMounted) return;
              setUserLocation({ latitude: 37.9838, longitude: 23.7275 });
              setLocationPermission("denied");
              setLoadingLocation(false);
              return;
            }
          } catch {
            // Permissions query fallback
          }
        }

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!isMounted) return;
              setUserLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
              setLocationPermission("granted");
              setLoadingLocation(false);
            },
            () => {
              if (!isMounted) return;
              // Athens default center fallback
              setUserLocation({
                latitude: 37.9838,
                longitude: 23.7275,
              });
              setLocationPermission("denied");
              setLoadingLocation(false);
            },
            { timeout: 5000 }
          );
        } else {
          setUserLocation({
            latitude: 37.9838,
            longitude: 23.7275,
          });
          setLocationPermission("denied");
          setLoadingLocation(false);
        }
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;
        setLocationPermission(status === "granted" ? "granted" : "denied");

        if (status !== "granted") {
          setUserLocation({
            latitude: 37.9838,
            longitude: 23.7275,
          });
          setLoadingLocation(false);
          return;
        }

        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;
        setUserLocation({
          latitude: initial.coords.latitude,
          longitude: initial.coords.longitude,
        });

        tap();

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 100,
            timeInterval: 30_000,
          },
          (loc) => {
            if (!isMounted) return;
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
      } catch (err) {
        console.warn("[useLocation] Error acquiring location:", err);
      } finally {
        if (isMounted) setLoadingLocation(false);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.remove === "function") {
        try {
          subscription.remove();
        } catch (e) {
          // ignore web shim removal errors
        }
      }
    };
  }, []);

  return useLocationStore();
}
