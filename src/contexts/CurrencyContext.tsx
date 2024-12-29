import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Define currency type
export type Currency = {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
};

// Arab countries currencies
export const arabCurrencies: Currency[] = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 3.75 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', rate: 30.90 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', rate: 0.31 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', rate: 3.64 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', rate: 0.376 },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', rate: 0.385 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', rate: 0.709 },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', rate: 15000 },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', rate: 1309 },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', rate: 134.85 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', rate: 10.08 },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', rate: 3.11 },
];

// Common world currencies
export const worldCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.91 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 144.38 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.15 },
  ...arabCurrencies,
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, fromCurrency?: Currency) => number;
  formatAmount: (amount: number) => string;
  getCurrencyDisplay: () => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(worldCurrencies[0]); // Default to USD
  const { i18n } = useTranslation();

  useEffect(() => {
    // Log current language for debugging
    console.log('Current language:', i18n.language);
  }, [i18n.language]);

  const convertAmount = (amount: number, fromCurrency?: Currency): number => {
    const from = fromCurrency || worldCurrencies[0]; // Default from USD if not specified
    // Convert from source currency to USD first (if not already USD)
    const usdAmount = from.code === 'USD' ? amount : amount / from.rate;
    // Then convert from USD to target currency
    return usdAmount * currency.rate;
  };

  const getCurrencyDisplay = () => {
    // Always show currency code for English interface
    if (i18n.language.startsWith('en')) {
      return currency.code;
    }
    // Show symbol for Arabic interface
    return currency.symbol;
  };

  const formatAmount = (amount: number): string => {
    const display = getCurrencyDisplay();
    const formattedAmount = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    // Add space between currency and amount
    return `${display} ${formattedAmount}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertAmount, formatAmount, getCurrencyDisplay }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
