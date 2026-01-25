import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logOut,
  resetPassword,
  getUserData,
} from "@/services/auth.service";
import type {
  AuthState,
  User,
  LoginCredentials,
  SignupCredentials,
  UserRole,
} from "@/types/user.types";

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const user = await signUpWithEmail(credentials);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await signInWithEmail(credentials);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const signInGoogle = createAsyncThunk(
  "auth/signInGoogle",
  async (role: UserRole | undefined, { rejectWithValue }) => {
    try {
      const user = await signInWithGoogle(role);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const signOutUser = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await logOut();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const sendPasswordReset = createAsyncThunk(
  "auth/resetPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      await resetPassword(email);
      return email;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Initialize auth state listener
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    return new Promise<User | null>((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userData = await getUserData(firebaseUser);
            dispatch(setUser(userData));
            resolve(userData);
          } catch (error) {
            console.error("Error getting user data:", error);
            dispatch(clearUser());
            resolve(null);
          }
        } else {
          dispatch(clearUser());
          resolve(null);
        }
      });
    });
  },
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Google Sign In
    builder
      .addCase(signInGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signInGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sign Out
    builder
      .addCase(signOutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Password Reset
    builder
      .addCase(sendPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Initialize
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { setUser, clearUser, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
