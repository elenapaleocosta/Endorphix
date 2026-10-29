import { create } from "zustand";
import { toIsoDate } from "@/utils";
import type { Booking } from "@/types";

export type NewBooking = Omit<Booking, "id" | "created_at" | "status" | "logged_energy_score">;

interface BookingState {
  bookings: Booking[];
  /** Booking whose 30-minute post-session check-in banner is showing. */
  alertBookingId: string | null;
  createBooking: (input: NewBooking) => Booking;
  /** Marks a session finished and raises the 30-minute check-in banner. */
  completeSession: (bookingId: string) => void;
  dismissAlert: () => void;
  markEnergyLogged: (bookingId: string, score: number) => void;
  reset: () => void;
}

const DAY_MS = 86_400_000;

function seedBooking(daysAgo: number, booking: Omit<Booking, "date" | "created_at">): Booking {
  const at = new Date(Date.now() - daysAgo * DAY_MS);
  return { ...booking, date: toIsoDate(at), created_at: at.toISOString() };
}

const SEED_BOOKINGS: Booking[] = [
  seedBooking(0, {
    id: "booking-tennis-demo",
    facility_id: "fac-heritage-1",
    facility_name: "The Royal Lawn & Racket Club",
    activity_name: "Tennis singles",
    activity_type: "tennis",
    sport_category: "tennis",
    court_or_slot: "Center clay court 1",
    start_time: "14:00",
    end_time: "15:00",
    status: "completed",
  }),
  seedBooking(1, {
    id: "booking-swim-yesterday",
    facility_id: "fac-heritage-3",
    facility_name: "Thalassa Coastal Aquatic Pavilion",
    activity_name: "Open water swim",
    activity_type: "swim",
    sport_category: "swimming",
    court_or_slot: "Lap lane 4",
    start_time: "08:00",
    end_time: "09:00",
    status: "energy_logged",
    logged_energy_score: 92,
  }),
  seedBooking(4, {
    id: "booking-soccer-lastweek",
    facility_id: "fac-heritage-6",
    facility_name: "Stamford Pitch & Athletic Arena",
    activity_name: "Football match",
    activity_type: "soccer",
    sport_category: "football",
    court_or_slot: "Turf field A",
    start_time: "18:00",
    end_time: "19:30",
    status: "energy_logged",
    logged_energy_score: 95,
  }),
  seedBooking(15, {
    id: "booking-basketball-lastmonth",
    facility_id: "fac-heritage-7",
    facility_name: "Metropolis Hoops & Court Center",
    activity_name: "Basketball 5v5",
    activity_type: "basketball",
    sport_category: "basketball",
    court_or_slot: "Main hardwood court",
    start_time: "19:00",
    end_time: "20:30",
    status: "energy_logged",
    logged_energy_score: 88,
  }),
  seedBooking(65, {
    id: "booking-hiking-2months",
    facility_id: "fac-heritage-4",
    facility_name: "Summit Ridge Alpine & Bouldering Crag",
    activity_name: "Alpine hike",
    activity_type: "hike",
    sport_category: "hiking",
    court_or_slot: "Trailhead",
    start_time: "07:00",
    end_time: "11:00",
    status: "energy_logged",
    logged_energy_score: 97,
  }),
];

export const useBookingStore = create<BookingState>((set) => ({
  bookings: SEED_BOOKINGS,
  alertBookingId: null,

  createBooking: (input) => {
    const booking: Booking = {
      ...input,
      id: `booking-${Date.now()}`,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };
    set((state) => ({ bookings: [booking, ...state.bookings] }));
    return booking;
  },

  completeSession: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)),
      alertBookingId: bookingId,
    })),

  dismissAlert: () => set({ alertBookingId: null }),

  markEnergyLogged: (bookingId, score) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "energy_logged", logged_energy_score: score } : b,
      ),
      alertBookingId: state.alertBookingId === bookingId ? null : state.alertBookingId,
    })),

  reset: () => set({ bookings: [], alertBookingId: null }),
}));
