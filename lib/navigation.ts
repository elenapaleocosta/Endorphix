import type { Href, useRouter } from "expo-router";

type Router = ReturnType<typeof useRouter>;

/**
 * After sign-in or sign-up: return to the screen that asked for an account (`next`, e.g. a venue's
 * Reserve button), which is still mounted underneath with its selection intact. Otherwise start at Discover.
 */
export function returnAfterAuth(router: Router, next?: string) {
  const target = next?.startsWith("/") ? next : undefined;
  if (target && router.canGoBack()) router.back();
  else router.replace((target ?? "/(tabs)/discover") as Href);
}

/** Goes back when there is history (native stack or in-app web navigation), otherwise replaces with `fallback`. */
export function goBackOr(router: Router, fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
