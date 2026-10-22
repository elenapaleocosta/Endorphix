import { useRef } from "react";
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { useRouter } from "expo-router";
import { useHaptics } from "@/hooks/useHaptics";

type TabRoute = "/(tabs)/discover" | "/(tabs)/energy" | "/(tabs)/profile";

interface SwipeTabsConfig {
  currentTab: TabRoute;
  leftRoute?: TabRoute;  // Navigated to when user slides LEFT (finger drag moves right-to-left: Discover -> Energy -> Profile)
  rightRoute?: TabRoute; // Navigated to when user slides RIGHT (finger drag moves left-to-right: Profile -> Energy -> Discover)
}

export function useSwipeTabs({ currentTab, leftRoute, rightRoute }: SwipeTabsConfig) {
  const router = useRouter();
  const { tap } = useHaptics();
  const isNavigating = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Only trigger on clear horizontal swipes so vertical scrolling isn't blocked
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15;
      },
      onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (isNavigating.current) return;
        const { dx, vx } = gestureState;

        // Slide left: finger drag moves to the left (dx < -30 or flick vx < -0.2)
        // Transition: Discover -> Energy -> Profile
        if ((dx < -30 || vx < -0.2) && leftRoute) {
          isNavigating.current = true;
          tap();
          router.navigate(leftRoute);
          setTimeout(() => {
            isNavigating.current = false;
          }, 350);
        }
        // Slide right: finger drag moves to the right (dx > 30 or flick vx > 0.2)
        // Transition: Profile -> Energy -> Discover
        else if ((dx > 30 || vx > 0.2) && rightRoute) {
          isNavigating.current = true;
          tap();
          router.navigate(rightRoute);
          setTimeout(() => {
            isNavigating.current = false;
          }, 350);
        }
      },
    })
  ).current;

  return panResponder;
}
