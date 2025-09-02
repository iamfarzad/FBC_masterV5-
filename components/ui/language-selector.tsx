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
      await webAppI18n.setLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLangData = supportedLanguages.find(lang => lang.code === currentLanguage);

  // Minimal variant (globe icon with dropdown)
  if (variant === 'minimal') {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-surface-elevated transition-colors min-h-11 min-w-11 justify-center",
            className
          )}
          aria-label="Select language"
        >
          <Globe className="size-4 text-text-muted" />
          <ChevronDown className="size-3" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className={cn(
              "absolute z-50 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg",
              position.includes('right') ? 'right-0' : 'left-0'
            )}>
              <div className="p-2">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-surface-elevated transition-colors",
                      currentLanguage === language.code && "bg-brand/10 text-brand"
                    )}
                  >
                    <div className="flex h-4 w-6 items-center justify-center rounded border border-border">
                      <span className="text-xs font-medium uppercase text-text-muted">
                        {language.code}
                      </span>
                    </div>
                    <span className="flex-1 text-text">{language.nativeName}</span>
                    {currentLanguage === language.code && (
                      <div className="size-2 rounded-full bg-brand" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Globe icon variant
  if (variant === 'flags') {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 rounded-lg border border-border px-3 py-2 transition-colors hover:border-border bg-surface"
        >
          <Globe className="size-4 text-text-muted" />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute z-50 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg",
            position.includes('right') ? 'right-0' : 'left-0'
          )}>
            <div className="p-2">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-surface-elevated transition-colors",
                    currentLanguage === language.code && "bg-brand/10 text-brand"
                  )}
                >
                  <div className="flex h-4 w-6 items-center justify-center rounded border border-border">
                    <span className="text-xs font-medium uppercase text-text-muted">
                      {language.code}
                    </span>
                  </div>
                  <span className="flex-1 text-text">{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <div className="size-2 rounded-full bg-brand" />
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
        className="flex items-center space-x-2 rounded-lg border border-border px-3 py-2 transition-colors hover:border-border bg-surface"
      >
        <Globe className="size-4 text-text-muted" />
        <span className="text-sm font-medium text-text">
          {showNativeName ? currentLangData?.nativeName : currentLangData?.name}
        </span>
        <ChevronDown className="size-3" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg",
          position.includes('right') ? 'right-0' : 'left-0'
        )}>
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              Select Language
            </div>

            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-surface-elevated transition-colors",
                  currentLanguage === language.code && "bg-brand/10 text-brand"
                )}
              >
                <div className="flex h-4 w-6 items-center justify-center rounded border border-border">
                  <span className="text-xs font-medium uppercase text-text-muted">
                    {language.code}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text">
                    {language.nativeName}
                  </div>
                  <div className="truncate text-xs text-text-muted">
                    {language.name}
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div className="size-2 rounded-full bg-brand" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-border p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Could open language settings modal here
              }}
              className="w-full px-3 py-2 text-left text-xs text-text-muted transition-colors hover:text-text"
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
      await webAppI18n.setLanguage(languageCode);
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
        "px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm",
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

// Note: useTranslation hook is now available via @/contexts/i18n-context

export default LanguageSelector;

