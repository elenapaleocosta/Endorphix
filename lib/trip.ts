import type { Facility, MacroRealm } from "@/types";

const REALM_ORDER: MacroRealm[] = ["land", "water", "mountain"];

const realmOf = (venue: Facility): MacroRealm => venue.macro_realm ?? "land";

/**
 * One venue id per day. Rotates through the realms that actually have venues, nearest first within
 * each, so a trip mixes court, water and mountain where the place allows. Repeats only when there
 * are fewer venues than days.
 */
export function planTrip(venues: Facility[], days: number): string[] {
  const byRealm = REALM_ORDER.map((realm) => venues.filter((v) => realmOf(v) === realm)).filter((list) => list.length);
  if (!byRealm.length) return [];

  // Interleave the realms: land #1, water #1, mountain #1, land #2, ...
  const order: Facility[] = [];
  const longest = Math.max(...byRealm.map((list) => list.length));
  for (let i = 0; i < longest; i++) {
    for (const list of byRealm) if (list[i]) order.push(list[i]);
  }
  return Array.from({ length: days }, (_, day) => order[day % order.length].id);
}

/**
 * Swaps one day's venue for the next one in the same realm that no other day is using,
 * falling back to any unused venue. Returns the picks unchanged when there is nothing to swap to.
 */
export function swapDay(picks: string[], dayIndex: number, venues: Facility[]): string[] {
  const current = venues.find((v) => v.id === picks[dayIndex]);
  if (!current) return picks;
  const taken = new Set(picks.filter((_, i) => i !== dayIndex));
  const free = venues.filter((v) => v.id !== current.id && !taken.has(v.id));
  const sameRealm = free.filter((v) => realmOf(v) === realmOf(current));

  // Cycle forward through the list so repeated swaps walk the options instead of bouncing between two.
  const after = (list: Facility[]) => {
    const start = venues.indexOf(current);
    return list.find((v) => venues.indexOf(v) > start) ?? list[0];
  };
  const next = sameRealm.length ? after(sameRealm) : free.length ? after(free) : undefined;
  if (!next) return picks;
  return picks.map((id, i) => (i === dayIndex ? next.id : id));
}

/** Whether a day has anything to swap to. */
export function canSwap(picks: string[], dayIndex: number, venues: Facility[]): boolean {
  return swapDay(picks, dayIndex, venues) !== picks;
}
