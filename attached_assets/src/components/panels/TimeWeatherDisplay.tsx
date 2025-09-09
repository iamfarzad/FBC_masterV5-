"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
}

const getWeatherIcon = (condition: WeatherData['condition']) => {
  const iconProps = { className: "w-3.5 h-3.5 text-primary" };
  
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

export const TimeWeatherDisplay = React.memo(() => {
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
    <div className="p-3 border-b border-border/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <motion.svg 
              className="w-3.5 h-3.5 text-primary" 
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
          </motion.div>
          <div>
            <motion.time 
              className="font-medium text-holographic" 
              dateTime={currentTime.toISOString()}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {formattedTime}
            </motion.time>
            <motion.div 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {formattedDate}
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <motion.div
              animate={{ 
                rotate: weather.condition === 'sunny' ? [0, 360] : 0,
                scale: weather.condition === 'sunny' ? [1, 1.05, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {getWeatherIcon(weather.condition)}
            </motion.div>
          </motion.div>
          <div>
            <motion.div 
              className="font-medium"
              whileHover={{ scale: 1.05 }}
            >
              {weather.temp}°F
            </motion.div>
            <div className="text-sm text-muted-foreground">{weather.condition}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

TimeWeatherDisplay.displayName = 'TimeWeatherDisplay';