import { Linking, Platform } from "react-native";
import type { Facility } from "@/types";

/** Opens turn-by-turn directions in the platform's maps app (Google Maps on web). */
export function openDirections(facility: Pick<Facility, "name" | "location">) {
  const { latitude, longitude } = facility.location;
  const label = encodeURIComponent(facility.name);

  const url = Platform.select({
    ios: `maps:?q=${label}&ll=${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  });

  return Linking.openURL(url);
}
