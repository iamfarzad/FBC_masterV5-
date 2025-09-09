"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
}

const getWeatherIcon = (condition: WeatherData['condition']) => {
  const iconProps = { className: "w-4 h-4 text-primary" };
  
  switch (condition) {
    case 'sunny':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconProps}>
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      );
    case 'cloudy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconProps}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
      );
    case 'rainy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconProps}>
          <line x1="16" y1="13" x2="16" y2="21"/>
          <line x1="8" y1="13" x2="8" y2="21"/>
          <line x1="12" y1="15" x2="12" y2="23"/>
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
        </svg>
      );
    default:
      return getWeatherIcon('sunny');
  }
};

export const WeatherTimeWidget = React.memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather] = useState<WeatherData>({
    temp: 72,
    condition: 'sunny',
    location: 'San Francisco, CA'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => 
    currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    [currentTime]
  );

  const formattedDate = useMemo(() => 
    currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    [currentTime]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-6 right-6 z-10 animate-float"
      role="complementary"
      aria-label="Weather and time information"
    >
      <div className="glass-card rounded-3xl p-4 min-w-52 interactive-lift effect-noise">
        <div className="space-y-3">
          {/* Time and Date */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center animate-glow-pulse" aria-hidden="true">
              <motion.svg 
                className="w-5 h-5 text-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </motion.svg>
            </div>
            <div>
              <time className="font-medium text-holographic" dateTime={currentTime.toISOString()}>
                {formattedTime}
              </time>
              <div className="text-muted-foreground">
                {formattedDate}
              </div>
            </div>
          </motion.div>
          
          {/* Weather and Location */}
          <motion.div 
            className="flex items-center gap-3 pt-2 border-t border-border/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center interactive-scale" aria-hidden="true">
              <motion.div
                animate={{ 
                  rotate: weather.condition === 'sunny' ? [0, 360] : 0,
                  scale: weather.condition === 'sunny' ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {getWeatherIcon(weather.condition)}
              </motion.div>
            </div>
            <div>
              <div className="font-medium">
                <span className="text-shimmer">{weather.temp}°F</span> • {weather.condition}
              </div>
              <div className="text-muted-foreground">
                {weather.location}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Subtle accent */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/[0.01] to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
});

WeatherTimeWidget.displayName = 'WeatherTimeWidget';