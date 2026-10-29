import type { Href, useRouter } from "expo-router";

type Router = ReturnType<typeof useRouter>;

/** Goes back when there is history (native stack or in-app web navigation), otherwise replaces with `fallback`. */
export function goBackOr(router: Router, fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
