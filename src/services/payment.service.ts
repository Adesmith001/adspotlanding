import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { updateBookingStatus, updatePaymentStatus } from "./billboard.service";
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

/**
 * Process a mock payment
 * In a real app, this would integrate with Paystack/Stripe
 */
export const processPayment = async (
  bookingId: string,
  amount: number,
  paymentMethod: string,
  advertiserId: string,
  ownerId: string,
  billboardTitle: string,
): Promise<{ success: boolean; reference: string }> => {
  try {
    // 1. Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Mock a transaction reference
    const reference = `REF-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // 3. Create payment record
    const payment = {
      bookingId,
      billboardTitle,
      advertiserId,
      ownerId,
      amount,
      currency: "NGN",
      status: "paid",
      paymentMethod,
      reference,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, PAYMENTS_COLLECTION), payment);

    // 4. Update booking status
    await updateBookingStatus(bookingId, "active");
    await updatePaymentStatus(bookingId, "paid", reference);

    // 5. Notify Owner
    await createNotification(
      ownerId,
      "payment_received",
      "Payment Received",
      `You received payment for booking on "${billboardTitle}"`,
      { bookingId },
      "/dashboard/owner/analytics",
    );

    // 6. Notify Advertiser
    await createNotification(
      advertiserId,
      "booking_confirmed",
      "Payment Successful",
      `Your booking for "${billboardTitle}" is now active.`,
      { bookingId },
      "/dashboard/advertiser/campaigns",
    );

    return { success: true, reference };
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

/**
 * Get payment history for a user (advertiser or owner)
 */
export const getPaymentHistory = async (
  userId: string,
  role: "owner" | "advertiser",
): Promise<PaymentTransaction[]> => {
  try {
    const field = role === "owner" ? "ownerId" : "advertiserId";
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where(field, "==", userId),
      // orderBy("createdAt", "desc"), // Removed to avoid index issues
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
