import axios from "axios";
import { useAuthStore } from "../features/Auth/authSlice";

export const baseurl = "https://xbxm1951-8000.inc1.devtunnels.ms/";
// export const baseurl = "https://api.inticure.com/";

export const api = axios.create({
  baseURL: `${baseurl}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const form_api = axios.create({
  baseURL: `${baseurl}`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const token_api = (token: string | null | undefined) => {
  const refreshToken = useAuthStore.getState().refreshToken;

  const instance = axios.create({
    baseURL: `${baseurl}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ? token : ""}`,
    },
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const newAccessToken = await refreshAccessToken(refreshToken);

        if (!newAccessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const get_api_form = (token: string | null | undefined) => {
  const refreshToken = useAuthStore.getState().refreshToken;
  const instance = axios.create({
    baseURL: `${baseurl}`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token ? token : ""}`,
    },
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const newAccessToken = await refreshAccessToken(refreshToken);

        if (!newAccessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

async function refreshAccessToken(refreshToken: string) {
  try {
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await fetch(`${baseurl}api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const { access } = await response.json();

    useAuthStore.getState().setAccessToken(access);

    return access;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    window.location.href = "/login";
    return null;
  }
}
