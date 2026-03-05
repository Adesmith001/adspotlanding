import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  User,
  UserRole,
  LoginCredentials,
  SignupCredentials,
} from "@/types/user.types";

// Google Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  credentials: SignupCredentials,
): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password,
    );

    // Update display name
    await updateProfile(userCredential.user, {
      displayName: credentials.displayName,
    });

    // Create user document in Firestore
    const userData: Omit<User, "uid"> = {
      email: credentials.email,
      displayName: credentials.displayName,
      photoURL: null,
      phoneNumber: credentials.phoneNumber || null,
      role: credentials.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: userCredential.user.uid,
      ...userData,
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  credentials: LoginCredentials,
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password,
    );

    return await getUserData(userCredential.user);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (role?: UserRole): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create new user document
      const userData: Omit<User, "uid"> = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        role: role || "advertiser", // Default to advertiser
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        uid: user.uid,
        ...userData,
      };
    }

    return await getUserData(user);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Initialize phone authentication
 * Returns RecaptchaVerifier that needs to be attached to a button
 */
export const initPhoneAuth = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
  });
};

/**
 * Send phone verification code
 */
export const sendPhoneVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier,
): Promise<ConfirmationResult> => {
  try {
    // Format phone number for Nigeria (+234)
    const formattedNumber = phoneNumber.startsWith("+234")
      ? phoneNumber
      : `+234${phoneNumber.replace(/^0/, "")}`;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedNumber,
      recaptchaVerifier,
    );

    return confirmationResult;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Verify phone code and sign in
 */
export const verifyPhoneCode = async (
  confirmationResult: ConfirmationResult,
  code: string,
  role?: UserRole,
): Promise<User> => {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create new user document
      const userData: Omit<User, "uid"> = {
        email: user.email,
        displayName: user.displayName || "User",
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        role: role || "advertiser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        uid: user.uid,
        ...userData,
      };
    }

    return await getUserData(user);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign out
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Change password for the currently signed-in user (requires re-authentication)
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No authenticated user found.");
    }
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  } catch (error: any) {
    const mapped = getAuthErrorMessage(error.code);
    throw new Error(mapped !== "An error occurred. Please try again."
      ? mapped
      : error.message || mapped);
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (
  firebaseUser: FirebaseUser,
): Promise<User> => {
  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

  if (!userDoc.exists()) {
    throw new Error("User data not found");
  }

  const data = userDoc.data();

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    role: data.role,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

/**
 * Get user-friendly error messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use":
      "This email is already registered. Please sign in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed":
      "This sign-in method is not enabled. Please contact support.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/user-not-found":
      "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/cancelled-popup-request":
      "Only one popup request is allowed at a time.",
    "auth/invalid-phone-number": "Please enter a valid Nigerian phone number.",
    "auth/invalid-verification-code":
      "Invalid verification code. Please try again.",
    "auth/code-expired":
      "Verification code has expired. Please request a new one.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
};
