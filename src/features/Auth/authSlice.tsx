import { create } from "zustand";
import { persist } from "zustand/middleware";

type DoctorLevel = "junior" | "senior" | null;

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  doctorLevel: DoctorLevel;
  login: (
    accessToken: string,
    refreshToken: string,
    doctorLevel: DoctorLevel
  ) => void;
  logout: () => void;
  setAccessToken: (accessToken: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      doctorLevel: null,
      login: (accessToken, refreshToken, doctorLevel) => {
        set({ accessToken, refreshToken, doctorLevel });
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, doctorLevel: null });
      },
      setAccessToken: (accessToken) => {
        set((state) => ({ ...state, accessToken }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
