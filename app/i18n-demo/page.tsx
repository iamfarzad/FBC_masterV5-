'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function I18nDemoPage() {
  const {
    currentLanguage,
    supportedLanguages,
    t,
    setLanguage
  } = useI18n();

  const [customText, setCustomText] = useState('Welcome to F.B/c AI Consulting!');

  const handleTranslate = async () => {
    // Simplified for now - just log the translation request
    console.log(`Would translate: "${customText}" to ${currentLanguage}`);
  };

  const currentLangData = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            i18n Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the internationalization system
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-8">
          <LanguageSelector variant="dropdown" />
        </div>

        {/* Current Language Info */}
        <div className="text-center">
          <p className="text-lg">
            Current Language: <strong>{currentLangData?.name || currentLanguage}</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Navigation: {t('nav.home')} | {t('nav.about')} | {t('nav.contact')}
          </p>
        </div>

        {/* Simple Translation Test */}
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Test Static Translations</h3>
            <div className="space-y-2">
              <p><strong>Hero Title:</strong> {t('hero.title')}</p>
              <p><strong>Hero Subtitle:</strong> {t('hero.subtitle')}</p>
              <p><strong>Get Started:</strong> {t('cta.getStarted')}</p>
              <p><strong>Learn More:</strong> {t('cta.learnMore')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

