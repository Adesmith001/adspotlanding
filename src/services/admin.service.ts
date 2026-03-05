import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const USERS_COLLECTION = "users";
const BILLBOARDS_COLLECTION = "billboards";
const PAYMENTS_COLLECTION = "payments";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: "owner" | "advertiser" | "admin";
  suspended?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface AdminBillboard {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  status: string;
  location: { city: string; state: string; address: string };
  type: string;
  createdAt: any;
}

/**
 * Get all users for admin management
 */
export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as AdminUser[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Toggle user suspension status
 */
export const toggleUserSuspension = async (
  uid: string,
  suspended: boolean,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      suspended,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user suspension:", error);
    throw error;
  }
};

/**
 * Update user role (promote to admin or revert to owner/advertiser)
 */
export const updateUserRole = async (
  uid: string,
  role: "owner" | "advertiser" | "admin",
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

/**
 * Get all billboards for admin verification
 */
export const getAllBillboards = async (): Promise<AdminBillboard[]> => {
  try {
    const snapshot = await getDocs(collection(db, BILLBOARDS_COLLECTION));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as AdminBillboard[];
  } catch (error) {
    console.error("Error fetching billboards:", error);
    throw error;
  }
};

/**
 * Update billboard status (approve / reject)
 */
export const updateBillboardAdminStatus = async (
  billboardId: string,
  status: "active" | "rejected",
): Promise<void> => {
  try {
    const billboardRef = doc(db, BILLBOARDS_COLLECTION, billboardId);
    await updateDoc(billboardRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating billboard status:", error);
    throw error;
  }
};

/**
 * Get recent transactions (system-wide)
 */
export const getAdminTransactions = async (
  maxCount: number = 50,
): Promise<any[]> => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error("Error fetching admin transactions:", error);
    throw error;
  }
};

/**
 * Get admin dashboard stats
 */
export const getAdminStats = async () => {
  try {
    const [users, billboards, payments] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, BILLBOARDS_COLLECTION)),
      getDocs(collection(db, PAYMENTS_COLLECTION)),
    ]);

    const totalRevenue = payments.docs
      .filter((d) => d.data().status === "paid")
      .reduce((sum, d) => sum + (d.data().amount || 0), 0);

    const owners = users.docs.filter((d) => d.data().role === "owner").length;
    const advertisers = users.docs.filter(
      (d) => d.data().role === "advertiser",
    ).length;
    const activeBillboards = billboards.docs.filter(
      (d) => d.data().status === "active",
    ).length;
    const pendingBillboards = billboards.docs.filter(
      (d) => d.data().status === "pending",
    ).length;

    return {
      totalUsers: users.size,
      owners,
      advertisers,
      totalBillboards: billboards.size,
      activeBillboards,
      pendingBillboards,
      totalRevenue,
      totalTransactions: payments.size,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};
