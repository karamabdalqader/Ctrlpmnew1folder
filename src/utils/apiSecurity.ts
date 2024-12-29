import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';
import { getConfig } from '../config/env';
import { secureStorage } from './secureStorage';
import { checkRateLimit } from './validation';

const config = getConfig();

class ApiSecurity {
  private api: AxiosInstance;
  private rateLimitConfig = {
    limit: 100,
    windowMs: 60000, // 1 minute
  };

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json'
      })
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        const token = secureStorage.getItem<string>('authToken');
        if (token) {
          if (!config.headers) {
            config.headers = new AxiosHeaders();
          }
          config.headers.set('Authorization', `Bearer ${token}`);
        }

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
          if (!config.headers) {
            config.headers = new AxiosHeaders();
          }
          config.headers.set('X-CSRF-Token', csrfToken);
        }

        // Check rate limit
        const endpoint = config.url || '';
        if (!checkRateLimit(endpoint, this.rateLimitConfig.limit, this.rateLimitConfig.windowMs)) {
          return Promise.reject(new Error('Rate limit exceeded'));
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Handle successful responses
        return response;
      },
      (error) => {
        if (error.response) {
          // Handle specific error cases
          switch (error.response.status) {
            case 401:
              // Handle unauthorized access
              secureStorage.removeItem('authToken');
              window.location.href = '/login';
              break;
            case 403:
              // Handle forbidden access
              console.error('Forbidden access:', error.response.data);
              break;
            case 429:
              // Handle rate limit exceeded
              console.error('Rate limit exceeded:', error.response.data);
              break;
            default:
              // Handle other errors
              console.error('API Error:', error.response.data);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Secure GET request
  async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Secure POST request
  async post<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Secure PUT request
  async put<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Secure DELETE request
  async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with an error
      return new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response received from server');
    } else {
      // Error in request setup
      return new Error('Error setting up request');
    }
  }
}

export const apiSecurity = new ApiSecurity();
