import { useRef } from "react";
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { useRouter } from "expo-router";
import { useHaptics } from "@/hooks/useHaptics";

type TabRoute = "/(tabs)/discover" | "/(tabs)/energy" | "/(tabs)/profile";

interface SwipeTabsConfig {
  currentTab: TabRoute;
  leftRoute?: TabRoute;  // Navigated to when user slides LEFT (finger/drag moves right-to-left, dx < -50)
  rightRoute?: TabRoute; // Navigated to when user slides RIGHT (finger/drag moves left-to-right, dx > 50)
}

export function useSwipeTabs({ currentTab, leftRoute, rightRoute }: SwipeTabsConfig) {
  const router = useRouter();
  const { tap } = useHaptics();
  const isNavigating = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Only trigger on intentional horizontal gestures
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15;
      },
      onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (isNavigating.current) return;
        const { dx, vx } = gestureState;

        // Slide left: user swipes finger to the left (dx < -45 or velocity < -0.3)
        if ((dx < -45 || vx < -0.3) && leftRoute) {
          isNavigating.current = true;
          tap();
          router.replace(leftRoute);
          setTimeout(() => {
            isNavigating.current = false;
          }, 350);
        }
        // Slide right: user swipes finger to the right (dx > 45 or velocity > 0.3)
        else if ((dx > 45 || vx > 0.3) && rightRoute) {
          isNavigating.current = true;
          tap();
          router.replace(rightRoute);
          setTimeout(() => {
            isNavigating.current = false;
          }, 350);
        }
      },
    })
  ).current;

  return panResponder;
}
