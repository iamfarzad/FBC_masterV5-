import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiTranslator } from '../gemini-translator';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationOptions {
  context?: string;
  tone?: 'professional' | 'casual' | 'technical';
}

/**
 * Simple, Fast Internationalization System
 */
export class WebAppI18n {
  private currentLanguage: string = 'en';
  private translator: GeminiTranslator | null = null;
  private supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ];

  // Static translations
  private translations: Record<string, Record<string, string>> = {
    'nav.home': {
      en: 'Home',
      no: 'Hjem',
      sv: 'Hem',
      da: 'Hjem',
      de: 'Startseite',
      fr: 'Accueil',
      es: 'Inicio'
    },
    'nav.about': {
      en: 'About',
      no: 'Om oss',
      sv: 'Om oss',
      da: 'Om os',
      de: 'Über uns',
      fr: 'À propos',
      es: 'Acerca de'
    },
    'nav.contact': {
      en: 'Contact',
      no: 'Kontakt',
      sv: 'Kontakt',
      da: 'Kontakt',
      de: 'Kontakt',
      fr: 'Contact',
      es: 'Contacto'
    },
    'hero.title': {
      en: 'AI Consulting for Modern Businesses',
      no: 'AI-rådgivning for moderne bedrifter',
      sv: 'AI-konsultation för moderna företag',
      da: 'AI-rådgivning for moderne virksomheder',
      de: 'KI-Beratung für moderne Unternehmen',
      fr: 'Conseil en IA pour les entreprises modernes',
      es: 'Consultoría de IA para empresas modernas'
    },
    'hero.subtitle': {
      en: 'Transform your business with cutting-edge AI solutions',
      no: 'Forvandle bedriften din med avanserte AI-løsninger',
      sv: 'Förvandla ditt företag med banbrytande AI-lösningar',
      da: 'Transformér din virksomhed med banebrydende AI-løsninger',
      de: 'Transformieren Sie Ihr Unternehmen mit modernsten KI-Lösungen',
      fr: 'Transformez votre entreprise avec des solutions IA de pointe',
      es: 'Transforma tu empresa con soluciones de IA de vanguardia'
    },
    'cta.getStarted': {
      en: 'Get Started',
      no: 'Kom i gang',
      sv: 'Kom igång',
      da: 'Kom i gang',
      de: 'Loslegen',
      fr: 'Commencer',
      es: 'Comenzar'
    },
    'cta.learnMore': {
      en: 'Learn More',
      no: 'Lær mer',
      sv: 'Läs mer',
      da: 'Lær mere',
      de: 'Mehr erfahren',
      fr: 'En savoir plus',
      es: 'Saber más'
    },
    'nav.consulting': {
      en: 'Consulting',
      no: 'Rådgivning',
      sv: 'Konsultation',
      da: 'Rådgivning',
      de: 'Beratung',
      fr: 'Conseil',
      es: 'Consultoría'
    },
    'nav.workshop': {
      en: 'Workshop',
      no: 'Workshop',
      sv: 'Workshop',
      da: 'Workshop',
      de: 'Workshop',
      fr: 'Atelier',
      es: 'Taller'
    }
  };

  constructor(initialLanguage?: string) {
    // Only create translator if API key is available
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.translator = apiKey ? new GeminiTranslator(apiKey) : null;

    // If initial language is provided, use it
    if (initialLanguage && this.isValidLanguage(initialLanguage)) {
      this.currentLanguage = initialLanguage;
    } else {
      // Initialize language from URL or localStorage
      this.initializeLanguage();
    }
  }

  /**
   * Initialize language from URL or localStorage
   */
  private initializeLanguage(): void {
    // Always default to English first
    this.currentLanguage = 'en';

    // Client-side only operations
    if (typeof window !== 'undefined') {
      try {
        // Check URL first
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam && this.isValidLanguage(langParam)) {
          this.currentLanguage = langParam;
          localStorage.setItem('preferred-language', langParam);
          return;
        }

        // Check localStorage
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.isValidLanguage(savedLang)) {
          this.currentLanguage = savedLang;
          return;
        }
      } catch (error) {
        console.warn('Language initialization failed:', error);
      }
    }
  }

  /**
   * Force re-initialization with current URL (for client-side navigation)
   */
  private reinitializeFromUrl(): void {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && this.isValidLanguage(langParam)) {
        this.currentLanguage = langParam;
        localStorage.setItem('preferred-language', langParam);
      }
    }
  }

  /**
   * Check if language code is valid
   */
  private isValidLanguage(langCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === langCode);
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Set language
   */
  async setLanguage(languageCode: string): Promise<void> {
    if (this.isValidLanguage(languageCode)) {
      this.currentLanguage = languageCode;

      // Only access browser APIs on client-side
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('preferred-language', languageCode);

          // Update URL
          const url = new URL(window.location.href);
          url.searchParams.set('lang', languageCode);
          window.history.replaceState({}, '', url.toString());

          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('languageChange', {
            detail: { language: languageCode }
          }));
        } catch (error) {
          console.warn('Failed to save language preference:', error);
        }
      }
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return this.supportedLanguages;
  }

  /**
   * Translate static text
   */
  t(key: string, fallback?: string): string {
    const translations = this.translations[key];
    if (!translations) {
      console.warn(`Translation key "${key}" not found`);
      return fallback || key;
    }

    return translations[this.currentLanguage] || translations.en || key;
  }

  /**
   * Translate dynamic text
   */
  async translate(text: string, options: TranslationOptions = {}): Promise<string> {
    // If no translator, return original text
    if (!this.translator || this.currentLanguage === 'en') {
      return text;
    }

    try {
      return await this.translator.translate(text, this.currentLanguage, options);
    } catch (error) {
      console.warn('Translation failed:', error);
      return text;
    }
  }
}

// Create singleton instance
export const webAppI18n = new WebAppI18n();