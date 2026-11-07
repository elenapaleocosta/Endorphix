import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Facility } from "@/types";

/** A snapshot of the venue at save time, so the bucket list renders without refetching. */
export type BucketItem = Pick<
  Facility,
  "id" | "name" | "address" | "rating" | "macro_realm" | "distance_meters" | "primary_sports" | "images"
> & { savedAt: number };

interface BucketState {
  /** Venues swiped right on the Spark, newest first. Persisted. */
  items: BucketItem[];
  /** Venues swiped left this session, kept out of the deck until a reshuffle. Not persisted: passes reset each launch. */
  skipped: string[];
  save: (venue: Facility) => void;
  skip: (venueId: string) => void;
  remove: (venueId: string) => void;
  /** Clears the skips, so every venue not yet saved comes back into the deck. */
  reshuffle: () => void;
}

export const useBucketStore = create<BucketState>()(
  persist(
    (set) => ({
      items: [],
      skipped: [],

      save: (venue) =>
        set((state) =>
          state.items.some((item) => item.id === venue.id)
            ? state
            : {
                items: [
                  {
                    id: venue.id,
                    name: venue.name,
                    address: venue.address,
                    rating: venue.rating,
                    macro_realm: venue.macro_realm,
                    distance_meters: venue.distance_meters,
                    primary_sports: venue.primary_sports,
                    images: venue.images.slice(0, 1),
                    savedAt: Date.now(),
                  },
                  ...state.items,
                ],
              },
        ),

      skip: (venueId) =>
        set((state) => ({ skipped: state.skipped.includes(venueId) ? state.skipped : [...state.skipped, venueId] })),

      remove: (venueId) => set((state) => ({ items: state.items.filter((item) => item.id !== venueId) })),

      reshuffle: () => set({ skipped: [] }),
    }),
    {
      name: "endorphix-bucket-list",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ items }) => ({ items }),
    },
  ),
);
