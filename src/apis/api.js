import axios from "axios";
import {
  getLocalStorage,
  removeAll,
  setLocalStorage,
} from "../utils/localStorageUtils";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../utils/constants/auth";
import i18next from "../i18n";
import { getToken } from "../utils/common";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const headers = {
  "x-csrf-protected": "x-csrf-protected",
  "X-Api-Version": "latest",
  // "Content-Type": "application/json",
  Accept: "application/json",
};

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = {
      ...headers,
      ...{
        "Content-Type": config.isFormData
          ? "multipart/form-data"
          : "application/json",
      },
    };

    const token = getToken();
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    if (config.useProdUrl) {
      config.baseURL = "https://api.buildeezy.com";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      return axios
        .put(BASE_URL + "/session", "", {
          headers: {
            "x-csrf-protected": "x-csrf-protected",
            "X-Api-Version": "latest",
            "Content-Type": "application/json",
            Authorization: "Bearer " + getLocalStorage(REFRESH_TOKEN_KEY),
          },
        })
        .then((res) => {
          if (res.status === 201) {
            // Update token in local storage
            setLocalStorage(ACCESS_TOKEN_KEY, res.data.data.accessToken);
            setLocalStorage(REFRESH_TOKEN_KEY, res.data.data.refreshToken);
            // Update the header and retry the original request
            originalRequest.headers["Authorization"] =
              "Bearer " + res.data.data.accessToken;
            return axios(originalRequest);
          } else {
            removeAll();
            window.location.href = "/";
            return;
          }
        })
        .catch((error) => {
          removeAll();
          window.location.href = "/";
          console.error(error);
        });
    }

    // const errorInstance = {
    //   error: true,
    //   message:
    //     error.response.data.errors[0].detail ||
    //     i18next.t("errors.default_error"),
    //   code: error.response.status,
    //   meta: error.response.data.errors[0].meta || "",
    // };

    const fallbackMessage = i18next.t("errors.default_error");
    const errorMessage =
      error.response?.data?.errors?.[0]?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      fallbackMessage;

    const errorInstance = {
      error: true,
      message: errorMessage,
      code: error.response?.status,
      meta: error.response?.data?.errors?.[0]?.meta || "",
    };

    return Promise.reject(errorInstance);
  }
);

export default axiosInstance;
