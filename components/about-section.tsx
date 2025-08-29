'use client';

import React from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutSectionProps {
  className?: string;
}

/**
 * About Section Component - Shows flexible content management
 * You can change the translations in src/core/i18n/index.ts anytime!
 */
export function AboutSection({ className }: AboutSectionProps) {
  const { t, currentLanguage } = useTranslation();

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text mb-4">
            {t('about.title')}
          </h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            {t('about.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current content (you can replace this anytime) */}
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                {t('content.wip')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted">
                This content will be replaced with your final copy. The component structure stays the same!
              </p>
            </CardContent>
          </Card>

          {/* Placeholder content */}
          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
              <CardDescription>
                {t('content.wip')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted">
                Update the translations in <code>src/core/i18n/index.ts</code> when ready.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo of language switching */}
        <div className="mt-12 text-center">
          <p className="text-sm text-text-muted">
            🌍 Current language: <strong>{currentLanguage.toUpperCase()}</strong>
            <br />
            Change the language selector to see instant translation updates!
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
