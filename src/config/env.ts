interface Config {
  apiUrl: string;
  apiVersion: string;
  auth: {
    domain: string;
    clientId: string;
    audience: string;
  };
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
  security: {
    csrfHeaderName: string;
    csrfCookieName: string;
    encryptionKey: string;
  };
}

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  apiVersion: process.env.REACT_APP_API_VERSION || 'v1',
  auth: {
    domain: process.env.REACT_APP_AUTH_DOMAIN || '',
    clientId: process.env.REACT_APP_AUTH_CLIENT_ID || '',
    audience: process.env.REACT_APP_AUTH_AUDIENCE || '',
  },
  features: {
    enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  },
  security: {
    csrfHeaderName: process.env.REACT_APP_CSRF_HEADER_NAME || 'X-CSRF-Token',
    csrfCookieName: process.env.REACT_APP_CSRF_COOKIE_NAME || 'XSRF-TOKEN',
    encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-replace-in-production',
  },
};

export const getConfig = (): Config => {
  return config;
};

export const validateConfig = (): string[] => {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push('API URL is required');
  }

  if (!config.auth.domain) {
    errors.push('Auth domain is required');
  }

  if (!config.auth.clientId) {
    errors.push('Auth client ID is required');
  }

  if (!config.security.encryptionKey) {
    errors.push('Encryption key is required');
  }

  return errors;
};

// Validate configuration on app startup
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error('Configuration errors:', configErrors);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid configuration. Check environment variables.');
  }
}

export default config;
