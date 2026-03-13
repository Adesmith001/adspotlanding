import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { uploadFiles, uploadImages } from "./cloudinary.service";
import { db } from "./firebase";
import { createNotification } from "./notification.service";
import { startConversation } from "./message.service";
import type {
  Billboard,
  Booking,
  CreativeApprovalStatus,
  Review,
  SearchFilters,
  SortOption,
  CreateBillboardForm,
  BookingRequest,
} from "@/types/billboard.types";

// Collections
const BILLBOARDS_COLLECTION = "billboards";
const BOOKINGS_COLLECTION = "bookings";
const REVIEWS_COLLECTION = "reviews";
const FAVORITES_COLLECTION = "favorites";

// Helper: Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};

const resolveLiveBookingStatus = (
  booking: Booking,
): Pick<Booking, "status" | "campaignStartedAt"> => {
  if (
    ["cancelled", "completed", "rejected", "pending"].includes(booking.status)
  ) {
    return {
      status: booking.status,
      campaignStartedAt: booking.campaignStartedAt,
    };
  }

  const shouldBeActive =
    booking.paymentStatus === "paid" &&
    booking.creativeApprovalStatus === "approved";

  return {
    status: shouldBeActive ? "active" : "confirmed",
    campaignStartedAt: shouldBeActive
      ? booking.campaignStartedAt || new Date()
      : undefined,
  };
};

// ==================== BILLBOARD SERVICES ====================

/**
 * Create a new billboard listing
 */
export const createBillboard = async (
  ownerId: string,
  ownerName: string,
  data: CreateBillboardForm,
  photos: File[],
): Promise<string> => {
  try {
    // Upload photos to Cloudinary
    const photoUrls = await uploadImages(photos);

    // Create billboard document
    const billboard: Omit<Billboard, "id"> = {
      ownerId,
      ownerName,
      ownerVerified: false,
      title: data.title,
      description: data.description,
      location: {
        address: data.address,
        city: data.city,
        state: data.state,
        country: "Nigeria",
        lat: data.latitude ?? 0,
        lng: data.longitude ?? 0,
        landmark: data.landmark,
      },
      dimensions: {
        width: data.width,
        height: data.height,
        unit: data.unit,
      },
      type: data.type,
      hasLighting: data.hasLighting,
      trafficScore: data.trafficScore,
      visibilityRating: 0,
      orientation: data.orientation,
      photos: photoUrls,
      streetViewAvailable: Boolean(data.latitude && data.longitude),
      pricing: {
        daily: data.dailyPrice,
        weekly: data.weeklyPrice,
        monthly: data.monthlyPrice,
        currency: "NGN",
      },
      pricePerDay: data.dailyPrice,
      unavailableDates: [],
      bookingRules: {
        instantBook: data.instantBook,
        minDuration: data.minDuration,
        maxDuration: data.maxDuration,
        cancellationPolicy: data.cancellationPolicy,
        advanceNotice: data.advanceNotice,
      },
      status: "pending",
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(
      collection(db, BILLBOARDS_COLLECTION),
      billboard,
    );
    return docRef.id;
  } catch (error: any) {
    console.error("Error creating billboard:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to create billboard listing: ${error.message || "Unknown error"}`,
    );
  }
};

/**
 * Get billboard by ID
 */
export const getBillboard = async (
  billboardId: string,
): Promise<Billboard | null> => {
  try {
    if (!billboardId) {
      console.error("getBillboard: No billboard ID provided");
      return null;
    }

    console.log("getBillboard: Fetching billboard with ID:", billboardId);
    const docRef = doc(db, BILLBOARDS_COLLECTION, billboardId);
    const docSnap = await getDoc(docRef);

    console.log("getBillboard: Document exists:", docSnap.exists());

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("getBillboard: Document data:", data);
      const billboard = {
        id: docSnap.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Billboard;
      console.log("getBillboard: Returning billboard:", billboard);
      return billboard;
    }
    console.log("getBillboard: Billboard not found for ID:", billboardId);
    return null;
  } catch (error) {
    console.error("Error getting billboard:", error);
    return null; // Return null instead of throwing to prevent cascading errors
  }
};

/**
 * Search billboards with filters
 */
export const searchBillboards = async (
  filters: SearchFilters,
  sortBy: SortOption = "newest",
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot,
): Promise<{ billboards: Billboard[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const constraints: QueryConstraint[] = [];

    // Status filter
    constraints.push(where("status", "==", "active"));

    // City filter
    if (filters.city) {
      constraints.push(where("location.city", "==", filters.city));
    }

    // State filter
    if (filters.state) {
      constraints.push(where("location.state", "==", filters.state));
    }

    // Billboard type filter
    if (filters.billboardType && filters.billboardType.length > 0) {
      constraints.push(where("type", "in", filters.billboardType));
    }

    // Lighting filter
    if (filters.hasLighting !== undefined) {
      constraints.push(where("hasLighting", "==", filters.hasLighting));
    }

    // Instant book filter
    if (filters.instantBookOnly) {
      constraints.push(where("bookingRules.instantBook", "==", true));
    }

    // Rating filter
    if (filters.minRating) {
      constraints.push(where("rating", ">=", filters.minRating));
    }

    // Traffic score filter
    if (filters.minTrafficScore) {
      constraints.push(where("trafficScore", ">=", filters.minTrafficScore));
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        constraints.push(orderBy("pricing.daily", "asc"));
        break;
      case "price-desc":
        constraints.push(orderBy("pricing.daily", "desc"));
        break;
      case "traffic-desc":
        constraints.push(orderBy("trafficScore", "desc"));
        break;
      case "rating-desc":
        constraints.push(orderBy("rating", "desc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("createdAt", "desc"));
        break;
    }

    // Pagination
    constraints.push(limit(pageSize));
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, BILLBOARDS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const billboards: Billboard[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Billboard;
    });

    const lastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { billboards, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error searching billboards:", error);
    throw new Error("Failed to search billboards");
  }
};

/**
 * Get billboards by owner
 */
export const getOwnerBillboards = async (
  ownerId: string,
): Promise<Billboard[]> => {
  try {
    const q = query(
      collection(db, BILLBOARDS_COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Billboard;
    });
  } catch (error) {
    console.error("Error getting owner billboards:", error);
    throw new Error("Failed to fetch owner billboards");
  }
};

/**
 * Update billboard
 */
export const updateBillboard = async (
  billboardId: string,
  updates: Partial<Billboard>,
): Promise<void> => {
  try {
    const docRef = doc(db, BILLBOARDS_COLLECTION, billboardId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating billboard:", error);
    throw new Error("Failed to update billboard");
  }
};

/**
 * Delete billboard
 */
export const deleteBillboard = async (billboardId: string): Promise<void> => {
  try {
    const docRef = doc(db, BILLBOARDS_COLLECTION, billboardId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting billboard:", error);
    throw new Error("Failed to delete billboard");
  }
};

/**
 * Increment billboard views
 */
export const incrementBillboardViews = async (
  billboardId: string,
): Promise<void> => {
  try {
    const docRef = doc(db, BILLBOARDS_COLLECTION, billboardId);
    const billboard = await getDoc(docRef);
    if (billboard.exists()) {
      await updateDoc(docRef, {
        views: (billboard.data().views || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};

// ==================== BOOKING SERVICES ====================

/**
 * Create a booking request
 */
export const createBooking = async (
  advertiserId: string,
  advertiserName: string,
  advertiserEmail: string,
  request: BookingRequest,
): Promise<string> => {
  try {
    // Get billboard details
    const billboard = await getBillboard(request.billboardId);
    if (!billboard) {
      throw new Error("Billboard not found");
    }

    // Calculate duration and price
    const duration = Math.ceil(
      (request.endDate.getTime() - request.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    let pricePerDay = billboard.pricing.daily;
    let totalAmount = pricePerDay * duration;

    // Apply weekly/monthly pricing if applicable
    if (duration >= 30) {
      totalAmount = billboard.pricing.monthly * Math.ceil(duration / 30);
      pricePerDay = totalAmount / duration;
    } else if (duration >= 7) {
      totalAmount = billboard.pricing.weekly * Math.ceil(duration / 7);
      pricePerDay = totalAmount / duration;
    }

    const creativeAssets = request.designFiles?.length
      ? await uploadFiles(request.designFiles)
      : [];

    const booking: Omit<Booking, "id"> = {
      billboardId: billboard.id,
      billboardTitle: billboard.title,
      billboardPhoto: billboard.photos[0] || "",
      advertiserId,
      advertiserName,
      advertiserEmail,
      ownerId: billboard.ownerId,
      ownerName: billboard.ownerName,
      ownerEmail: "", // Will be fetched from user profile
      startDate: request.startDate,
      endDate: request.endDate,
      duration,
      pricePerDay,
      totalAmount,
      currency: "NGN",
      status: billboard.bookingRules.instantBook ? "confirmed" : "pending",
      paymentStatus: "pending",
      campaignPhotos: [],
      campaignNotes: request.message?.trim() || undefined,
      creativeRequirementType: request.creativeRequirementType,
      creativeAssets,
      creativeBrief: request.creativeBrief.trim(),
      creativeApprovalStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);

    const creativeSummary =
      request.creativeRequirementType === "advertiser_upload"
        ? `I have uploaded ${creativeAssets.length} design file${
            creativeAssets.length === 1 ? "" : "s"
          } for review.`
        : `I would like your company to create the design. Brief: ${request.creativeBrief.trim()}`;

    const initialMessage = [
      `Hi, I just booked \"${
        billboard.title
      }\" from ${request.startDate.toLocaleDateString(
        "en-NG",
      )} to ${request.endDate.toLocaleDateString("en-NG")}.`,
      creativeSummary,
      request.message?.trim() || "",
    ]
      .filter(Boolean)
      .join(" ");

    await startConversation(advertiserId, billboard.ownerId, initialMessage);

    await createNotification(
      billboard.ownerId,
      "booking_request",
      "New Booking Request",
      `${advertiserName} submitted a booking request for \"${billboard.title}\" with creative details ready for review.`,
      { bookingId: docRef.id, billboardId: billboard.id },
      "/dashboard/owner/bookings",
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
};

/**
 * Get booking by ID
 */
export const getBooking = async (
  bookingId: string,
): Promise<Booking | null> => {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: timestampToDate(data.startDate),
        endDate: timestampToDate(data.endDate),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Booking;
    }
    return null;
  } catch (error) {
    console.error("Error getting booking:", error);
    throw new Error("Failed to fetch booking");
  }
};

/**
 * Get bookings for advertiser
 */
export const getAdvertiserBookings = async (
  advertiserId: string,
): Promise<Booking[]> => {
  try {
    // No server-side orderBy to avoid composite index requirement; sort client-side
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("advertiserId", "==", advertiserId),
    );

    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: timestampToDate(data.startDate),
        endDate: timestampToDate(data.endDate),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Booking;
    });
    return bookings.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } catch (error) {
    console.error("Error getting advertiser bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
};

/**
 * Real-time subscription to advertiser bookings
 */
export const subscribeToAdvertiserBookings = (
  advertiserId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("advertiserId", "==", advertiserId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: timestampToDate(data.startDate),
          endDate: timestampToDate(data.endDate),
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
        } as Booking;
      });
      const sorted = bookings.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      callback(sorted);
    },
    (error) => {
      console.error("Error subscribing to advertiser bookings:", error);
    },
  );
};

/**
 * Get bookings for owner
 */
export const getOwnerBookings = async (ownerId: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: timestampToDate(data.startDate),
        endDate: timestampToDate(data.endDate),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Booking;
    });
  } catch (error) {
    console.error("Error getting owner bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: Booking["status"],
): Promise<void> => {
  try {
    const booking = await getBooking(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "active") {
      updates.campaignStartedAt = new Date();
    }

    await updateDoc(docRef, updates);

    if (status === "confirmed") {
      await createNotification(
        booking.advertiserId,
        "booking_confirmed",
        "Booking Approved",
        `Your booking for "${booking.billboardTitle}" was approved. The owner can now review the creative before payment is due.`,
        { bookingId, billboardId: booking.billboardId },
        "/dashboard/advertiser/campaigns",
      );
    }

    if (status === "rejected") {
      await createNotification(
        booking.advertiserId,
        "booking_cancelled",
        "Booking Declined",
        `Your booking request for "${booking.billboardTitle}" was declined by the owner.`,
        { bookingId, billboardId: booking.billboardId },
        "/dashboard/advertiser/campaigns",
      );
    }

    // Restore billboard availability and prompt review when campaign completes
    if (status === "completed") {
      try {
        await updateBillboard(booking.billboardId, { status: "active" });
      } catch (err) {
        console.error("Error restoring billboard status:", err);
      }
      await createNotification(
        booking.advertiserId,
        "review_prompt",
        "How was your campaign? ⭐",
        `Your campaign on "${booking.billboardTitle}" has ended. Share your experience to help others!`,
        { bookingId, billboardId: booking.billboardId },
        `/dashboard/advertiser/campaigns?review=${bookingId}`,
      );
    }

    // Restore billboard availability on cancellation/rejection as well
    if (status === "cancelled") {
      try {
        await updateBillboard(booking.billboardId, { status: "active" });
      } catch (err) {
        console.error(
          "Error restoring billboard status after cancellation:",
          err,
        );
      }
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking");
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  bookingId: string,
  paymentStatus: Booking["paymentStatus"],
  paymentId?: string,
): Promise<void> => {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      paymentStatus,
      paymentId,
      paidAt: paymentStatus === "paid" ? new Date() : null,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Failed to update payment");
  }
};

export const syncBookingCampaignStatus = async (
  bookingId: string,
): Promise<Booking | null> => {
  const booking = await getBooking(bookingId);
  if (!booking) {
    return null;
  }

  const next = resolveLiveBookingStatus(booking);
  const updates: Record<string, unknown> = {
    status: next.status,
    updatedAt: new Date(),
  };

  if (next.status === "active") {
    updates.campaignStartedAt = next.campaignStartedAt || new Date();
  }

  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), updates);

  // Lock the billboard when a campaign goes active to prevent double-booking
  if (next.status === "active" && booking.status !== "active") {
    try {
      await updateBillboard(booking.billboardId, { status: "inactive" });
    } catch (err) {
      console.error("Error locking billboard status:", err);
    }
  }

  return {
    ...booking,
    status: next.status,
    campaignStartedAt: next.campaignStartedAt,
    updatedAt: new Date(),
  };
};

export const updateCreativeApprovalStatus = async (
  bookingId: string,
  creativeApprovalStatus: CreativeApprovalStatus,
  creativeReviewNotes?: string,
): Promise<Booking | null> => {
  try {
    const booking = await getBooking(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      creativeApprovalStatus,
      creativeReviewNotes: creativeReviewNotes?.trim() || null,
      creativeReviewedAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedBooking = await syncBookingCampaignStatus(bookingId);

    if (creativeApprovalStatus === "approved") {
      await createNotification(
        booking.advertiserId,
        "creative_approved",
        "Creative Approved",
        `Your creative for \"${booking.billboardTitle}\" has been approved.${
          booking.paymentStatus === "paid"
            ? " The campaign can now go live."
            : " Complete payment to lock the booking and launch the campaign."
        }`,
        { bookingId, billboardId: booking.billboardId },
        booking.paymentStatus === "paid"
          ? "/dashboard/advertiser/campaigns"
          : "/dashboard/advertiser/payments",
      );
    }

    if (creativeApprovalStatus === "changes_requested") {
      await createNotification(
        booking.advertiserId,
        "creative_changes_requested",
        "Creative Changes Requested",
        creativeReviewNotes?.trim() ||
          `The owner requested more detail or revisions for \"${booking.billboardTitle}\".`,
        { bookingId, billboardId: booking.billboardId },
        "/dashboard/advertiser/campaigns",
      );
    }

    return updatedBooking;
  } catch (error) {
    console.error("Error updating creative approval status:", error);
    throw new Error("Failed to update creative approval status");
  }
};

// ==================== REVIEW SERVICES ====================

/**
 * Create a review and mark the booking as reviewed
 */
export const createReview = async (
  bookingId: string,
  billboardId: string,
  advertiserId: string,
  advertiserName: string,
  rating: number,
  comment: string,
): Promise<string> => {
  try {
    const review: Omit<Review, "id"> = {
      billboardId,
      bookingId,
      advertiserId,
      advertiserName,
      rating,
      comment,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);

    // Update billboard rating
    await updateBillboardRating(billboardId);

    // Mark booking as reviewed so the prompt doesn't re-appear
    try {
      await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
        reviewedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error marking booking as reviewed:", err);
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("Failed to create review");
  }
};

/**
 * Auto-complete expired active campaigns for an advertiser and send review prompts.
 * Called client-side when the advertiser visits their campaigns page.
 */
export const checkAndCompleteExpiredCampaigns = async (
  advertiserId: string,
): Promise<void> => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("advertiserId", "==", advertiserId),
      where("status", "==", "active"),
    );
    const snapshot = await getDocs(q);
    const now = new Date();

    await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const endDate: Date = data.endDate?.toDate
          ? data.endDate.toDate()
          : new Date(data.endDate);

        if (endDate < now) {
          const bookingId = docSnap.id;
          const billboardId = data.billboardId as string;
          const billboardTitle = data.billboardTitle as string;

          // Mark completed
          await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
            status: "completed",
            updatedAt: new Date(),
          });

          // Restore billboard availability
          try {
            await updateBillboard(billboardId, { status: "active" });
          } catch (err) {
            console.error("Error restoring billboard:", err);
          }

          // Only send review notification if not already reviewed
          if (!data.reviewedAt) {
            await createNotification(
              advertiserId,
              "review_prompt",
              "How was your campaign? ⭐",
              `Your campaign on "${billboardTitle}" has ended. Share your experience to help others!`,
              { bookingId, billboardId },
              `/dashboard/advertiser/campaigns?review=${bookingId}`,
            );
          }
        }
      }),
    );
  } catch (error) {
    console.error("Error checking expired campaigns:", error);
  }
};

/**
 * Get reviews for billboard
 */
export const getBillboardReviews = async (
  billboardId: string,
): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("billboardId", "==", billboardId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Review;
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    throw new Error("Failed to fetch reviews");
  }
};

/**
 * Update billboard rating based on reviews
 */
const updateBillboardRating = async (billboardId: string): Promise<void> => {
  try {
    const reviews = await getBillboardReviews(billboardId);
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await updateBillboard(billboardId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    } as Partial<Billboard>);
  } catch (error) {
    console.error("Error updating billboard rating:", error);
  }
};

// ==================== FAVORITES SERVICES ====================

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (
  userId: string,
  billboardId: string,
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where("userId", "==", userId),
      where("billboardId", "==", billboardId),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Remove favorite
      await deleteDoc(doc(db, FAVORITES_COLLECTION, snapshot.docs[0].id));
      return false;
    } else {
      // Add favorite
      await addDoc(collection(db, FAVORITES_COLLECTION), {
        userId,
        billboardId,
        createdAt: serverTimestamp(),
      });
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

/**
 * Check if billboard is favorited
 */
export const isBillboardFavorited = async (
  userId: string,
  billboardId: string,
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where("userId", "==", userId),
      where("billboardId", "==", billboardId),
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

/**
 * Get available billboard locations
 */
export const getAvailableLocations = async (): Promise<string[]> => {
  try {
    const q = query(
      collection(db, BILLBOARDS_COLLECTION),
      where("status", "==", "active"),
    );
    const snapshot = await getDocs(q);

    const cities = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.location?.city) {
        cities.add(data.location.city);
      }
    });

    return Array.from(cities).sort();
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

/**
 * Get user favorites
 */
export const getUserFavorites = async (
  userId: string,
): Promise<Billboard[]> => {
  try {
    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    const billboardIds = snapshot.docs.map((doc) => doc.data().billboardId);

    if (billboardIds.length === 0) return [];

    // Firestore 'in' query supports max 10 items. For simplicity/robustness, we'll fetch individually or chunks.
    // For now, simpler approach: fetch all and filter client side or fetch individually.
    // Better: simple Promise.all

    const billboards = await Promise.all(
      billboardIds.map((id) => getBillboard(id)),
    );

    return billboards.filter((b) => b !== null) as Billboard[];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
};
