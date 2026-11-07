import { Easing } from "react-native-reanimated";

/**
 * Shared motion tokens. Built-in easings are too weak for UI; use these instead.
 * Never ease-in on UI: it delays the moment the user is watching.
 */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

/** Press feedback: quick down, slightly slower release. */
export const PRESS_SCALE = 0.98;
export const PRESS_IN_MS = 100;
export const PRESS_OUT_MS = 150;
