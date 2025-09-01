'use client';

import React, { useState, useEffect } from 'react';
import { webAppI18n, Language } from '@/src/core/i18n';
import { ChevronDown, Globe } from '@/src/core/icon-mapping';
import { cn } from '@/src/core/utils';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'minimal' | 'flags';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showNativeName?: boolean;
  className?: string;
}

/**
 * Language Selector Component
 * Provides multiple UI variants for language selection
 */
export function LanguageSelector({
  variant = 'dropdown',
  position = 'top-right',
  showNativeName = true,
  className
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);

  useEffect(() => {
    // Initialize with current language
    setCurrentLanguage(webAppI18n.getCurrentLanguage());
    setSupportedLanguages(webAppI18n.getSupportedLanguages());

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await webAppI18n.setLanguage(languageCode, 'user');
      setCurrentLanguage(languageCode);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLangData = supportedLanguages.find(lang => lang.code === currentLanguage);

  // Minimal variant (globe icon only)
  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          className
        )}
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <ChevronDown className="w-3 h-3" />
      </button>
    );
  }

  // Globe icon variant
  if (variant === 'flags') {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
            position.includes('right') ? 'right-0' : 'left-0'
          )}>
            <div className="p-2">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                    currentLanguage === language.code && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  )}
                >
                  <div className="w-6 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                      {language.code}
                    </span>
                  </div>
                  <span className="flex-1">{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full dropdown variant (default)
  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">
          {showNativeName ? currentLangData?.nativeName : currentLangData?.name}
        </span>
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
          position.includes('right') ? 'right-0' : 'left-0'
        )}>
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Select Language
            </div>

            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  currentLanguage === language.code && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                )}
              >
                <div className="w-6 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    {language.code}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {language.nativeName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {language.name}
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Could open language settings modal here
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Language Settings
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Compact version for mobile
export function MobileLanguageSelector({ className }: { className?: string }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);

  useEffect(() => {
    setCurrentLanguage(webAppI18n.getCurrentLanguage());
    setSupportedLanguages(webAppI18n.getSupportedLanguages());

    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await webAppI18n.setLanguage(languageCode, 'user');
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLangData = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <select
      value={currentLanguage}
      onChange={(e) => handleLanguageSelect(e.target.value)}
      className={cn(
        "px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm",
        className
      )}
    >
      {supportedLanguages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.code.toUpperCase()} - {language.nativeName}
        </option>
      ))}
    </select>
  );
}

// Hook for using i18n in components
export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    setCurrentLanguage(webAppI18n.getCurrentLanguage());

    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  return {
    t: (key: string, lang?: string) => webAppI18n.t(key, lang),
    translate: (text: string, lang?: string) => webAppI18n.translate(text, lang),
    currentLanguage,
    setLanguage: (lang: string) => webAppI18n.setLanguage(lang, 'user'),
    supportedLanguages: webAppI18n.getSupportedLanguages()
  };
}

export default LanguageSelector;

