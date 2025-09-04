'use client';

import React, { useState, useEffect } from 'react';
import { webAppI18n, Language } from '@/src/core/i18n';
import { Globe, Check, Languages, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedLanguageSelectorProps {
  variant?: 'button' | 'icon' | 'text';
  className?: string;
}

// Language codes for display (no emoji flags)
const languageCodes = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
  zh: 'ZH',
  ja: 'JA',
  ko: 'KO',
  ar: 'AR',
  hi: 'HI',
};

// Flags for display (emoji flags)
const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  no: '🇳🇴',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷'
}

export function EnhancedLanguageSelector({ 
  variant = 'icon',
  className 
}: EnhancedLanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLangData = supportedLanguages.find(lang => lang.code === currentLanguage);
  const currentCode = languageCodes[currentLanguage as keyof typeof languageCodes] || currentLanguage.toUpperCase();

  // Icon-only variant - Clean and minimal
  if (variant === 'icon') {
    return (
      <div className={cn("relative", className)}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex h-9 w-9 items-center justify-center",
            "rounded-lg transition-all duration-200",
            "hover:bg-accent/10"
          )}
          aria-label="Select language"
        >
          <Globe className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.3 }}
                className={cn(
                  "absolute right-0 z-50 mt-2",
                  "w-64 overflow-hidden rounded-lg",
                  "border border-border",
                  "bg-popover",
                  "shadow-md"
                )}
              >
                <div className="border-b border-border mb-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Select Language
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto px-2 pb-2">
                  {supportedLanguages.map((language, index) => {
                    const isSelected = currentLanguage === language.code;
                    const langCode = languageCodes[language.code as keyof typeof languageCodes] || language.code.toUpperCase();

                    return (
                      <motion.button
                        key={language.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-lg px-3 py-2",
                          "transition-all duration-150",
                          isSelected 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-10 items-center justify-center rounded",
                          "text-xs font-bold",
                          isSelected
                            ? "bg-accent-foreground/10 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {langCode}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            {language.nativeName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language.name}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Button variant with text
  if (variant === 'button') {
    return (
      <div className={cn("relative", className)}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group flex items-center gap-2 px-4 py-2",
            "rounded-xl transition-all duration-200",
            "bg-card/50 hover:bg-accent/10",
            "border border-border/30 hover:border-accent/30",
            "shadow-sm hover:shadow-md",
            "backdrop-blur-sm"
          )}
        >
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {currentLangData?.nativeName || currentCode}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.3 }}
                className={cn(
                  "absolute right-0 z-50 mt-2",
                  "w-72 overflow-hidden rounded-lg",
                  "border border-border",
                  "bg-popover",
                  "shadow-md"
                )}
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Language
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto px-2 pb-2">
                  {supportedLanguages.map((language) => {
                    const isSelected = currentLanguage === language.code;
                    const langCode = languageCodes[language.code as keyof typeof languageCodes] || language.code.toUpperCase();

                    return (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2",
                          "transition-all duration-150",
                          isSelected 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-10 items-center justify-center rounded",
                          "text-xs font-bold",
                          isSelected
                            ? "bg-accent-foreground/10 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {langCode}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            {language.nativeName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language.name}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Text-only variant - Most minimal
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "text-sm font-medium text-foreground/70 hover:text-accent",
        "transition-colors duration-200",
        className
      )}
    >
      {currentLanguage.toUpperCase()}
    </button>
  );
}

export default EnhancedLanguageSelector;