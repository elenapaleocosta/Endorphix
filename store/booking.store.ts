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

  createBooking: (booking: Omit<Booking, "id" | "created_at" | "status" | "notification_scheduled_time">) => Booking;
  triggerPostSessionNotification: (bookingId: string) => void;
  openEnergyLoggingForBooking: (booking: Booking) => void;
  clearNotification: () => void;
  markEnergyLogged: (bookingId: string, score: number) => void;
}

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "booking-tennis-demo",
    facility_id: "fac-1",
    facility_name: "Obsidian Athletic Sanctuary",
    activity_name: "Tennis",
    activity_type: "tennis",
    court_or_slot: "Center Clay Court 1",
    date: "Today",
    start_time: "14:00",
    end_time: "15:00",
    notification_scheduled_time: "15:30 (30m after session)",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: INITIAL_BOOKINGS,
  // Start with demo post-activity notification already active for immediate demonstration
  pendingNotification: {
    id: "notif-tennis-1",
    booking_id: "booking-tennis-demo",
    facility_name: "Obsidian Athletic Sanctuary",
    activity_name: "Tennis",
    slot_time: "14:00 - 15:00",
    message: "Your 14:00-15:00 Tennis session ended 30m ago. How are your somatic energy levels?",
    timestamp: "15:30",
  },
  activeBookingToLog: INITIAL_BOOKINGS[0],

  createBooking: (data) => {
    const newBooking: Booking = {
      ...data,
      id: "booking-" + Date.now(),
      status: "confirmed",
      notification_scheduled_time: "30m after completion",
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
    }));

    // Auto-schedule demo notification trigger after 4 seconds to simulate post-activity flow
    setTimeout(() => {
      get().triggerPostSessionNotification(newBooking.id);
    }, 3500);

    return newBooking;
  },

  triggerPostSessionNotification: (bookingId: string) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    set({
      pendingNotification: {
        id: "notif-" + Date.now(),
        booking_id: booking.id,
        facility_name: booking.facility_name,
        activity_name: booking.activity_name,
        slot_time: `${booking.start_time} - ${booking.end_time}`,
        message: `Your ${booking.start_time}-${booking.end_time} ${booking.activity_name} session ended 30m ago. How are your somatic energy levels?`,
        timestamp: "Just now (30m post-session)",
      },
      activeBookingToLog: booking,
    });
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
