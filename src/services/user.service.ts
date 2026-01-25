import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const USERS_COLLECTION = "users";

export interface UserPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  newBookings: boolean;
  marketingUpdates: boolean;
  securityAlerts: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  bio?: string;
  company?: string;
  website?: string;
  role: "owner" | "advertiser";
  preferences: UserPreferences;
  createdAt?: any;
  updatedAt?: any;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  emailAlerts: true,
  smsAlerts: false,
  newBookings: true,
  marketingUpdates: false,
  securityAlerts: true,
};

/**
 * Create or update a user profile
 */
export const syncUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  role: "owner" | "advertiser",
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      const newUser: UserProfile = {
        uid,
        email,
        displayName,
        role,
        preferences: DEFAULT_PREFERENCES,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newUser);
    } else {
      // Update existing user login time or basic info if needed
      await updateDoc(userRef, {
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error syncing user profile:", error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user profile details
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  uid: string,
  preferences: Partial<UserPreferences>,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentPrefs = userSnap.data().preferences || DEFAULT_PREFERENCES;
      await updateDoc(userRef, {
        preferences: { ...currentPrefs, ...preferences },
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};
