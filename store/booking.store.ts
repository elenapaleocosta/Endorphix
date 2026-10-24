import { create } from "zustand";
import type { Booking, ActivityType } from "@/types";

interface NotificationBanner {
  id: string;
  booking_id: string;
  facility_name: string;
  activity_name: string;
  slot_time: string;
  message: string;
  timestamp: string;
}

interface BookingState {
  bookings: Booking[];
  pendingNotification: NotificationBanner | null;
  activeBookingToLog: Booking | null;

  createBooking: (
    booking: Omit<Booking, "id" | "created_at" | "status" | "notification_scheduled_time">
  ) => Booking;
  triggerPostSessionNotification: (bookingId: string) => void;
  openEnergyLoggingForBooking: (booking: Booking) => void;
  clearNotification: () => void;
  markEnergyLogged: (bookingId: string, score: number) => void;
  simulate30MinutesPostSession: (bookingId?: string) => void;
}

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "booking-tennis-demo",
    facility_id: "fac-heritage-1",
    facility_name: "The Royal Lawn & Racket Club",
    activity_name: "Tennis Singles",
    activity_type: "tennis",
    court_or_slot: "Center Clay Court 1",
    date: "Today",
    start_time: "14:00",
    end_time: "15:00",
    notification_scheduled_time: "15:30 (30m after session ends)",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "booking-swim-yesterday",
    facility_id: "fac-heritage-3",
    facility_name: "Thalassa Coastal Aquatic Pavilion",
    activity_name: "Open Water Swell Swim",
    activity_type: "swim",
    court_or_slot: "Olympic Lap Lane 4",
    date: "Yesterday",
    start_time: "08:00",
    end_time: "09:00",
    notification_scheduled_time: "09:30 (30m after session)",
    status: "energy_logged",
    logged_energy_score: 92,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
];

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: INITIAL_BOOKINGS,
  // Start with demo post-activity 30m notification active for immediate demonstration
  pendingNotification: {
    id: "notif-tennis-30m",
    booking_id: "booking-tennis-demo",
    facility_name: "The Royal Lawn & Racket Club",
    activity_name: "Tennis Singles",
    slot_time: "14:00 - 15:00",
    message: "Your 14:00-15:00 Tennis session ended 30 minutes ago. Tap to slide your Somatic Energy High.",
    timestamp: "15:30 · 30m Post-Session",
  },
  activeBookingToLog: INITIAL_BOOKINGS[0],

  createBooking: (data) => {
    const newBooking: Booking = {
      ...data,
      id: "booking-" + Date.now(),
      status: "confirmed",
      notification_scheduled_time: "Scheduled for 30m post-session",
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
    }));

    // Simulate the 30-minute post-activity timer after 4.5 seconds for instant in-app demonstration
    setTimeout(() => {
      get().simulate30MinutesPostSession(newBooking.id);
    }, 4500);

    return newBooking;
  },

  simulate30MinutesPostSession: (bookingId?: string) => {
    const targetId = bookingId || get().bookings[0]?.id;
    const booking = get().bookings.find((b) => b.id === targetId);
    if (!booking) return;

    // Mark booking as completed (session finished + 30m elapsed)
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === targetId ? { ...b, status: "completed" } : b
      ),
      pendingNotification: {
        id: "notif-" + Date.now(),
        booking_id: booking.id,
        facility_name: booking.facility_name,
        activity_name: booking.activity_name,
        slot_time: `${booking.start_time} - ${booking.end_time}`,
        message: `Your ${booking.start_time}-${booking.end_time} ${booking.activity_name} session ended 30m ago. How are your somatic endorphin levels?`,
        timestamp: "30m Post-Session Alert",
      },
      activeBookingToLog: { ...booking, status: "completed" },
    }));
  },

  triggerPostSessionNotification: (bookingId: string) => {
    get().simulate30MinutesPostSession(bookingId);
  },

  openEnergyLoggingForBooking: (booking: Booking) => {
    set({
      activeBookingToLog: booking,
      pendingNotification: null,
    });
  },

  clearNotification: () => {
    set({ pendingNotification: null });
  },

  markEnergyLogged: (bookingId: string, score: number) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: "energy_logged", logged_energy_score: score }
          : b
      ),
      activeBookingToLog: null,
      pendingNotification: null,
    }));
  },
}));
