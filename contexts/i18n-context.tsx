'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { webAppI18n, Language } from '@/src/core/i18n';

interface I18nContextType {
  // Current language
  currentLanguage: string;

  // Translation functions
  t: (key: string, fallback?: string) => string;
  translate: (text: string, options?: any) => Promise<string>;

  // Language management
  setLanguage: (languageCode: string) => Promise<void>;
  supportedLanguages: Language[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

/**
 * I18n Provider Component
 * Provides internationalization context to the entire application
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
  const searchParams = useSearchParams();

  // Initialize i18n system
  useEffect(() => {
    // Set supported languages
    setSupportedLanguages(webAppI18n.getSupportedLanguages());

    // Use the initialized language first
    setCurrentLanguage(webAppI18n.getCurrentLanguage());

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('languageChange', handleLanguageChange as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('languageChange', handleLanguageChange as EventListener);
      }
    };
  }, []);

  // Handle URL parameter changes (for navigation within the app)
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && supportedLanguages.some(lang => lang.code === langParam)) {
      webAppI18n.setLanguage(langParam);
      setCurrentLanguage(langParam);
    }
  }, [searchParams, supportedLanguages]);

  // Check for URL parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && supportedLanguages.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && supportedLanguages.some(lang => lang.code === langParam)) {
        console.log('Found URL language parameter:', langParam);
        webAppI18n.setLanguage(langParam);
        setCurrentLanguage(langParam);
      }
    }
  }, [supportedLanguages]);

  // Translation function
  const translate = async (text: string, options?: any): Promise<string> => {
    return await webAppI18n.translate(text, options);
  };

  // Translation key function
  const t = (key: string, fallback?: string): string => {
    return webAppI18n.t(key, fallback);
  };

  // Set language function
  const setLanguage = async (languageCode: string): Promise<void> => {
    await webAppI18n.setLanguage(languageCode);
    setCurrentLanguage(languageCode);
  };

  const contextValue: I18nContextType = {
    currentLanguage,
    t,
    translate,
    setLanguage,
    supportedLanguages
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to use i18n context
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook for simple translations (most common use case)
 */
export function useTranslation() {
  const { t, translate, currentLanguage } = useI18n();

  return {
    t,
    translate,
    currentLanguage,
    // Common translation helpers
    formatDate: (date: Date) => {
      return date.toLocaleDateString(
        currentLanguage === 'no' ? 'nb-NO' : currentLanguage === 'en' ? 'en-US' : currentLanguage,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      );
    },
    formatNumber: (num: number) => {
      return num.toLocaleString(currentLanguage === 'no' ? 'nb-NO' : currentLanguage);
    },
    formatCurrency: (amount: number, currency = 'USD') => {
      return amount.toLocaleString(
        currentLanguage === 'no' ? 'nb-NO' : currentLanguage,
        {
          style: 'currency',
          currency
        }
      );
    }
  };
}

/**
 * Higher-order component for i18n support
 */
export function withI18n<P extends object>(
  Component: React.ComponentType<P>
) {
  return function I18nComponent(props: P) {
    const i18n = useI18n();
    return <Component {...props} i18n={i18n} />;
  };
}

export default I18nProvider;

