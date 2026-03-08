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
import { updateBookingStatus, updatePaymentStatus } from "./billboard.service";
import { createNotification } from "./notification.service";
import { PaymentStatus } from "@/types/billboard.types";

const PAYMENTS_COLLECTION = "payments";

const KORAPAY_PUBLIC_KEY = import.meta.env.VITE_KORAPAY_PUBLIC_KEY || "";

declare global {
  interface Window {
    Korapay: any;
    KoraPay: any;
  }
}

export interface KorapayConfig {
  key: string;
  reference: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
  };
  notification_url?: string;
  onClose?: () => void;
  onSuccess?: (data: KorapaySuccessData) => void;
  onFailed?: (data: any) => void;
}

export interface KorapaySuccessData {
  reference: string;
  status: string;
  amount: number;
  [key: string]: any;
}

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

/**
 * Generate a unique payment reference
 */
const generateReference = (): string => {
  return `ADSPOT-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

/**
 * Launch KoraPay checkout popup and process payment
 */
export const processPayment = async (
  bookingId: string,
  amount: number,
  _paymentMethod: string,
  advertiserId: string,
  ownerId: string,
  billboardTitle: string,
  customerName: string,
  customerEmail: string,
): Promise<{ success: boolean; reference: string }> => {
  return new Promise((resolve, reject) => {
    const KoraSDK = window.Korapay || window.KoraPay;

    if (!KoraSDK) {
      reject(
        new Error(
          "KoraPay SDK not loaded. Please refresh the page and try again.",
        ),
      );
      return;
    }

    if (
      !KORAPAY_PUBLIC_KEY ||
      KORAPAY_PUBLIC_KEY === "your_korapay_public_key_here"
    ) {
      reject(new Error("KoraPay public key is not configured."));
      return;
    }

    const reference = generateReference();

    const config: KorapayConfig = {
      key: KORAPAY_PUBLIC_KEY,
      reference,
      amount,
      currency: "NGN",
      customer: {
        name: customerName,
        email: customerEmail,
      },
      onSuccess: async (data: KorapaySuccessData) => {
        try {
          const paymentReference = data.reference || reference;

          // 1. Update booking first so campaigns can render even if later writes fail
          await updateBookingStatus(bookingId, "active");
          await updatePaymentStatus(bookingId, "paid", paymentReference);

          // 2. Create payment record in Firestore
          const payment = {
            bookingId,
            billboardTitle,
            advertiserId,
            ownerId,
            amount,
            currency: "NGN",
            status: "paid",
            paymentMethod: "korapay",
            reference: paymentReference,
            korapayData: data,
            createdAt: serverTimestamp(),
          };

          await addDoc(collection(db, PAYMENTS_COLLECTION), payment);

          // 3. Notify Owner
          await createNotification(
            ownerId,
            "payment_received",
            "Payment Received",
            `You received ₦${amount.toLocaleString()} for booking on "${billboardTitle}"`,
            { bookingId },
            "/dashboard/owner/analytics",
          );

          // 4. Notify Advertiser
          await createNotification(
            advertiserId,
            "booking_confirmed",
            "Payment Successful",
            `Your booking for "${billboardTitle}" is now active.`,
            { bookingId },
            "/dashboard/advertiser/campaigns",
          );

          resolve({ success: true, reference: paymentReference });
        } catch (error) {
          console.error(
            "Error recording payment after KoraPay success:",
            error,
          );
          // Payment was successful on KoraPay side, but we failed to update our records
          // Still resolve with success so user knows payment went through
          resolve({ success: true, reference: data.reference || reference });
        }
      },
      onClose: () => {
        reject(new Error("Payment was cancelled."));
      },
      onFailed: (data: any) => {
        console.error("KoraPay payment failed:", data);
        reject(new Error("Payment failed. Please try again."));
      },
    };

    KoraSDK.initialize(config);
  });
};

/**
 * Subscribe to successful advertiser payments keyed by booking ID.
 */
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

/**
 * Get payment history for a user (advertiser or owner)
 */
export const getPaymentHistory = async (
  userId: string,
  role: "owner" | "advertiser" | "admin",
): Promise<PaymentTransaction[]> => {
  try {
    const field = role === "owner" ? "ownerId" : "advertiserId";
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where(field, "==", userId),
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as PaymentTransaction[];

    // Client-side sort to avoid index requirement
    return results.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};
