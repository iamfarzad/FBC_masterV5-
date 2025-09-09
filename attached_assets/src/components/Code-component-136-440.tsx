"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
}

export const CompactWeatherWidget = React.memo(() => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-6 z-10"
    >
      <div className="glass-card rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-holographic">
              {currentTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
              })}
            </div>
            <div className="text-muted-foreground text-sm">
              {currentTime.toLocaleDateString([], { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.svg 
              className="w-4 h-4 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </motion.svg>
            <span className="text-sm text-shimmer">{weather.temp}°F</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CompactWeatherWidget.displayName = 'CompactWeatherWidget';