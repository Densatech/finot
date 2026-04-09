
import axios, { InternalAxiosRequestConfig, AxiosHeaders, AxiosResponse } from 'axios';

// Extend the InternalAxiosRequestConfig interface to include the _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _baseUrlRetry?: boolean;
}

// No base URL – requests will be relative to the current origin
const PRIMARY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const FALLBACK_API_URL = import.meta.env.VITE_API_FALLBACK_URL || 'https://finot.onrender.com';
const API_BASE_URL_STORAGE_KEY = 'finot_active_api_base_url';

const getStoredApiBaseURL = () => {
  if (typeof window === 'undefined') {
    return PRIMARY_API_URL;
  }

  return window.sessionStorage.getItem(API_BASE_URL_STORAGE_KEY) || PRIMARY_API_URL;
};

const axiosInstance = axios.create({
  baseURL: getStoredApiBaseURL(),
});

const setStoredApiBaseURL = (url: string) => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(API_BASE_URL_STORAGE_KEY, url);
  }

  axiosInstance.defaults.baseURL = url;
};

// Add token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    // CRITICAL: Ensure headers object exists
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (token) {
       // DIRECT ASSIGNMENT: This is safer than .set() for mixed environments
       // and works for both plain objects and AxiosHeaders instances.
       (config.headers as any)['Authorization'] = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401s (Refresh Logic)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!error.response && originalRequest && !originalRequest._baseUrlRetry) {
      const currentBaseURL = String(originalRequest.baseURL || axiosInstance.defaults.baseURL || PRIMARY_API_URL);

      if (FALLBACK_API_URL && currentBaseURL !== FALLBACK_API_URL) {
        originalRequest._baseUrlRetry = true;
        originalRequest.baseURL = FALLBACK_API_URL;
        setStoredApiBaseURL(FALLBACK_API_URL);
        return axiosInstance(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Use basic axios to avoid the interceptor loop during refresh
          const { data } = await axios.post(`${axiosInstance.defaults.baseURL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);
          
          // Re-attach the new token with the correct prefix - matching request interceptor logic
          if (originalRequest.headers instanceof AxiosHeaders) {
              originalRequest.headers.set('Authorization', `JWT ${data.access}`);
          } else {
             // Fallback for unlikely case where headers is not an AxiosHeaders instance
             // However, with our setup above, it should always be. 
             // We'll create a new headers instance if needed.
             const newHeaders = new AxiosHeaders(originalRequest.headers);
             newHeaders.set('Authorization', `JWT ${data.access}`);
             originalRequest.headers = newHeaders;
          }
          
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
