import CryptoJS from 'crypto-js';
import { getConfig } from '../config/env';

const config = getConfig();
const STORAGE_KEY_PREFIX = 'secure_';

interface StorageOptions {
  expires?: number; // Time in milliseconds
}

class SecureStorage {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = config.security.encryptionKey;
  }

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      return null;
    }
  }

  setItem(key: string, value: any, options: StorageOptions = {}): void {
    const storageItem = {
      data: value,
      expires: options.expires ? Date.now() + options.expires : null,
    };

    const encryptedValue = this.encrypt(storageItem);
    localStorage.setItem(STORAGE_KEY_PREFIX + key, encryptedValue);
  }

  getItem<T>(key: string): T | null {
    const encryptedValue = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    
    if (!encryptedValue) {
      return null;
    }

    const storageItem = this.decrypt(encryptedValue);
    
    if (!storageItem) {
      return null;
    }

    if (storageItem.expires && Date.now() > storageItem.expires) {
      this.removeItem(key);
      return null;
    }

    return storageItem.data as T;
  }

  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const secureStorage = new SecureStorage();
