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
} from "firebase/firestore";
import { uploadImages } from "./cloudinary.service";
import { db } from "./firebase";
import type {
  Billboard,
  Booking,
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
        lat: 0, // Will be set by geocoding
        lng: 0,
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
      streetViewAvailable: false,
      pricing: {
        daily: data.dailyPrice,
        weekly: data.weeklyPrice,
        monthly: data.monthlyPrice,
        currency: "NGN",
      },
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
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
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("advertiserId", "==", advertiserId),
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
    console.error("Error getting advertiser bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
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
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
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

// ==================== REVIEW SERVICES ====================

/**
 * Create a review
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

    return docRef.id;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("Failed to create review");
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
