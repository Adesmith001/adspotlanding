export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "owner" | "advertiser" | "admin";
export type PublicUserRole = Exclude<UserRole, "admin">;

export interface UserProfile extends User {
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName: string;
  role: PublicUserRole;
  phoneNumber?: string;
}

export interface PendingGoogleSignup {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

export type GoogleSignupResult =
  | {
      requiresRoleSelection: true;
      profile: PendingGoogleSignup;
    }
  | {
      requiresRoleSelection: false;
      user: User;
    };

export interface AuthError {
  code: string;
  message: string;
}
