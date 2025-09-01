'use client';

import React from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { Button } from '@/components/ui/button';
import { ArrowRight } from '@/src/core/icon-mapping';

interface HeroSectionProps {
  className?: string;
}

/**
 * Hero Section Component - Internationalized
 * Demonstrates how to use static translations for UI elements
 */
export function HeroSection({ className }: HeroSectionProps) {
  const { t, currentLanguage } = useTranslation();

  // Static content that doesn't need AI translation (cost-effective)
  const features = [
    {
      key: 'feature.1',
      default: 'Intelligent Chatbots',
      no: 'Intelligente Chatbots',
      en: 'Intelligent Chatbots'
    },
    {
      key: 'feature.2',
      default: 'Process Automation',
      no: 'Prosessautomatisering',
      en: 'Process Automation'
    },
    {
      key: 'feature.3',
      default: 'AI Consulting',
      no: 'AI Konsultasjon',
      en: 'AI Consulting'
    }
  ];

  return (
    <section className={`relative py-20 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-text-muted mb-8 max-w-3xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {features.map((feature) => (
            <span
              key={feature.key}
              className="px-4 py-2 bg-surface-elevated border border-border rounded-full text-sm font-medium"
            >
              {t(feature.key)}
            </span>
          ))}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-brand hover:bg-brand-hover text-surface px-8 py-3 text-lg"
          >
            {t('cta.getStarted')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg"
          >
            {t('cta.learnMore')}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm">
            Trusted by companies worldwide • Available in {t('nav.services').toLowerCase()}
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
