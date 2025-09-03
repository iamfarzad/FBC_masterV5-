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

const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  hi: '🇮🇳',
};

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
  const currentFlag = languageFlags[currentLanguage as keyof typeof languageFlags] || '🌐';

  // Icon-only variant - Clean and minimal
  if (variant === 'icon') {
    return (
      <div className={cn("relative", className)}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center",
            "rounded-xl transition-all duration-200",
            "bg-card/50 hover:bg-accent/10",
            "border border-border/30 hover:border-accent/30",
            "shadow-sm hover:shadow-md",
            "backdrop-blur-sm"
          )}
          aria-label="Select language"
        >
          <Globe className="h-4 w-4 text-foreground/70 transition-colors group-hover:text-accent" />
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[10px]">
            {currentLanguage.toUpperCase()}
          </div>
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
                  "w-56 overflow-hidden rounded-2xl",
                  "border border-border/50",
                  "bg-card/95 backdrop-blur-xl",
                  "shadow-2xl shadow-black/10"
                )}
              >
                <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Select Language
                  </h3>
                </div>
                
                <div className="max-h-80 overflow-y-auto p-2">
                  {supportedLanguages.map((language, index) => {
                    const isSelected = currentLanguage === language.code;
                    const flag = languageFlags[language.code as keyof typeof languageFlags] || '🌐';
                    
                    return (
                      <motion.button
                        key={language.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
                          "transition-all duration-200",
                          isSelected 
                            ? "bg-accent/15 text-accent" 
                            : "hover:bg-accent/5 text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <span className="text-xl">{flag}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            {language.nativeName}
                          </div>
                          <div className="text-xs opacity-70">
                            {language.name}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-accent"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
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
          <span className="text-lg">{currentFlag}</span>
          <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
            {currentLangData?.code.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 text-foreground/50" />
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
                  "w-64 overflow-hidden rounded-2xl",
                  "border border-border/50",
                  "bg-card/95 backdrop-blur-xl",
                  "shadow-2xl shadow-black/10"
                )}
              >
                <div className="grid grid-cols-2 gap-2 p-3">
                  {supportedLanguages.map((language) => {
                    const isSelected = currentLanguage === language.code;
                    const flag = languageFlags[language.code as keyof typeof languageFlags] || '🌐';
                    
                    return (
                      <motion.button
                        key={language.code}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl p-3",
                          "transition-all duration-200",
                          isSelected 
                            ? "bg-gradient-to-br from-accent/20 to-primary/20 text-accent shadow-md" 
                            : "hover:bg-accent/5 text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <span className="text-2xl">{flag}</span>
                        <span className="text-xs font-medium">
                          {language.code.toUpperCase()}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, y: -10 }}
                            animate={{ scale: 1, y: 0 }}
                            className="absolute -top-1 -right-1"
                          >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent shadow-lg">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </motion.div>
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