// Function to get CSRF token from meta tag
export const getCSRFToken = (): string | null => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

// Axios interceptor to add CSRF token to requests
export const setupCSRFToken = (axios: any) => {
  axios.interceptors.request.use(
    (config: any) => {
      const token = getCSRFToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

// Function to validate CSRF token
export const validateCSRFToken = (token: string | null): boolean => {
  if (!token) return false;
  // Add additional validation if needed
  return token.length > 0;
};
