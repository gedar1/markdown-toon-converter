import { create } from "zustand";
import type { User, CreatorProfile, SubscriberProfile } from "../types";

interface AuthState {
  user: User | null;
  profile: CreatorProfile | SubscriberProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (
    user: User,
    profile: CreatorProfile | SubscriberProfile,
    token: string,
  ) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, profile, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("profile", JSON.stringify(profile));

    set({
      user,
      profile,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    set({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  initAuth: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const profileStr = localStorage.getItem("profile");

    if (token && userStr && profileStr) {
      try {
        const user = JSON.parse(userStr);
        const profile = JSON.parse(profileStr);
        set({
          user,
          profile,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to parse stored auth data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("profile");
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
