import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  getBooking,
  syncBookingCampaignStatus,
  updatePaymentStatus,
} from "./billboard.service";
import { createNotification } from "./notification.service";
import { PaymentStatus } from "@/types/billboard.types";

const PAYMENTS_COLLECTION = "payments";

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  billboardTitle: string;
  advertiserId: string;
  ownerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  reference: string;
  createdAt: any;
}

export interface PaidBookingInfo {
  bookingId: string;
  reference: string;
  amount: number;
  createdAt: Date;
}

const generateReference = (): string => {
  return `ADSPOT-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

const recordSuccessfulPayment = async (
  bookingId: string,
  advertiserId: string,
  ownerId: string,
  billboardTitle: string,
  amount: number,
  paymentReference: string,
): Promise<{ success: boolean; reference: string }> => {
  const booking = await getBooking(bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.paymentStatus === "paid") {
    return { success: true, reference: booking.paymentId || paymentReference };
  }

  await updatePaymentStatus(bookingId, "paid", paymentReference);
  const syncedBooking = await syncBookingCampaignStatus(bookingId);
  const isActive = syncedBooking?.status === "active";

  const existingPayments = await getDocs(
    query(
      collection(db, PAYMENTS_COLLECTION),
      where("reference", "==", paymentReference),
    ),
  );

  if (existingPayments.empty) {
    await addDoc(collection(db, PAYMENTS_COLLECTION), {
      bookingId,
      billboardTitle,
      advertiserId,
      ownerId,
      amount,
      currency: "NGN",
      status: "paid",
      paymentMethod: "korapay",
      reference: paymentReference,
      createdAt: serverTimestamp(),
    });
  }

  await createNotification(
    ownerId,
    "payment_received",
    "Payment Received",
    `You received ₦${amount.toLocaleString()} for booking on "${billboardTitle}"`,
    { bookingId },
    "/dashboard/owner/analytics",
  );

  await createNotification(
    advertiserId,
    "booking_confirmed",
    "Payment Successful",
    isActive
      ? `Your booking for "${billboardTitle}" is now active.`
      : `Payment for "${billboardTitle}" was received. Design work can now start while the owner finishes review and launch prep.`,
    { bookingId },
    "/dashboard/advertiser/campaigns",
  );

  return { success: true, reference: paymentReference };
};

export const verifyKorapayPayment = async (
  bookingId: string,
  advertiserId: string,
  ownerId: string,
  billboardTitle: string,
  amount: number,
  reference: string,
): Promise<{ success: boolean; reference: string }> => {
  const response = await fetch(
    `/api/korapay/verify?reference=${encodeURIComponent(reference)}`,
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to verify payment.");
  }

  const normalizedStatus = String(payload?.status || "").toLowerCase();
  if (!["success", "successful", "paid"].includes(normalizedStatus)) {
    throw new Error("Payment has not been confirmed yet.");
  }

  return recordSuccessfulPayment(
    bookingId,
    advertiserId,
    ownerId,
    billboardTitle,
    amount,
    payload?.reference || reference,
  );
};

export const processPayment = async (
  bookingId: string,
  amount: number,
  _paymentMethod: string,
  _advertiserId: string,
  _ownerId: string,
  billboardTitle: string,
  customerName: string,
  customerEmail: string,
): Promise<{ success: boolean; reference: string }> => {
  const booking = await getBooking(bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.paymentStatus === "paid") {
    throw new Error("This booking has already been paid for.");
  }

  if (!booking.paymentRequestedAt) {
    throw new Error(
      "Payment is not available until the owner approves the booking.",
    );
  }

  if (
    booking.paymentDueAt &&
    new Date(booking.paymentDueAt).getTime() < Date.now()
  ) {
    throw new Error(
      "The 3-day payment window has expired. Please contact the owner to reopen the booking.",
    );
  }

  const reference = generateReference();
  const redirectUrl = `${window.location.origin}/dashboard/advertiser/payments?bookingId=${encodeURIComponent(
    bookingId,
  )}&reference=${encodeURIComponent(reference)}`;

  const response = await fetch("/api/korapay/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "NGN",
      reference,
      redirectUrl,
      bookingId,
      customerName,
      customerEmail,
      description: `Payment for "${billboardTitle}"`,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.checkoutUrl) {
    throw new Error(payload?.message || "Unable to start payment.");
  }

  window.location.assign(payload.checkoutUrl);
  return { success: true, reference };
};

export const subscribeToAdvertiserPaidBookings = (
  advertiserId: string,
  callback: (paidBookings: Record<string, PaidBookingInfo>) => void,
): (() => void) => {
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("advertiserId", "==", advertiserId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const paidBookings = snapshot.docs.reduce<Record<string, PaidBookingInfo>>(
        (acc, doc) => {
          const data = doc.data();
          if (data.status !== "paid" || !data.bookingId) {
            return acc;
          }

          const createdAt = data.createdAt?.toDate?.() || new Date();
          const existing = acc[data.bookingId];
          if (!existing || existing.createdAt.getTime() < createdAt.getTime()) {
            acc[data.bookingId] = {
              bookingId: data.bookingId,
              reference: data.reference || "",
              amount: data.amount || 0,
              createdAt,
            };
          }

          return acc;
        },
        {},
      );

      callback(paidBookings);
    },
    (error) => {
      console.error("Error subscribing to advertiser payments:", error);
      callback({});
    },
  );
};

export const getPaymentHistory = async (
  userId: string,
  role: "owner" | "advertiser" | "admin",
): Promise<PaymentTransaction[]> => {
  try {
    const field = role === "owner" ? "ownerId" : "advertiserId";
    const q = query(collection(db, PAYMENTS_COLLECTION), where(field, "==", userId));

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as PaymentTransaction[];

    return results.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};
