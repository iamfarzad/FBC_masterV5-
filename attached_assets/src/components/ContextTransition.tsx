import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ContextTransitionProps {
  currentStage?: string;
  isTransitioning?: boolean;
  children: React.ReactNode;
}

const stageVisuals = {
  greeting: {
    background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1), transparent 50%)',
    particles: 'welcome',
    accent: 'pulse'
  },
  discovery: {
    background: 'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.08), transparent 50%)',
    particles: 'analyze',
    accent: 'scan'
  },
  solution: {
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 50%)',
    particles: 'construct',
    accent: 'build'
  },
  booking: {
    background: 'radial-gradient(circle at 60% 80%, rgba(255,255,255,0.15), transparent 50%)',
    particles: 'calendar',
    accent: 'schedule'
  }
};

export const ContextTransition: React.FC<ContextTransitionProps> = ({
  currentStage = 'greeting',
  isTransitioning = false,
  children
}) => {
  const [currentVisual, setCurrentVisual] = useState(stageVisuals.greeting);

  useEffect(() => {
    if (currentStage && stageVisuals[currentStage as keyof typeof stageVisuals]) {
      setCurrentVisual(stageVisuals[currentStage as keyof typeof stageVisuals]);
    }
  }, [currentStage]);

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        key={currentStage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        style={{ background: currentVisual.background }}
      />
      
      {/* Contextual Particles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`particles-${currentStage}`}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.8 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              animate={{
                x: [0, Math.random() * 100, Math.random() * -100, 0],
                y: [0, Math.random() * 100, Math.random() * -100, 0],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* Stage Indicator */}
      <motion.div
        className="fixed top-6 right-6 z-50"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="holo-card px-4 py-2 rounded-full backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs text-foreground/80 uppercase tracking-widest">
              {currentStage ? currentStage.replace('_', ' ') : 'Loading'}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Content with transition effects */}
      <motion.div
        className="relative z-10"
        animate={isTransitioning ? { scale: 0.98, opacity: 0.8 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};