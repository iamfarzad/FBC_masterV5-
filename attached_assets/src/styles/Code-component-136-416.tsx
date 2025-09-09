@custom-variant dark (&:is(.dark *));

:root {
  /* Modern Color Variables */
  --color-void-black: #000000;
  --color-deep-black: #0a0a0a;
  --color-carbon-black: #1a1a1a;
  --color-gunmetal: #2a2a2a;
  --color-gunmetal-lighter: #3a3a3a;
  --color-steel-gray: #404040;
  --color-silver-mist: #808080;
  --color-light-silver: #c0c0c0;
  --color-light-silver-darker: #e0e0e0;
  --color-pure-white: #ffffff;
  --color-ghost-white: #f8f8f8;
  
  /* Holographic Accent Colors for Active States */
  --color-holo-active: rgba(255, 255, 255, 0.15);
  --color-holo-active-hover: rgba(255, 255, 255, 0.25);
  
  /* Holographic Accent Colors */
  --color-holo-primary: #ffffff;
  --color-holo-secondary: #e0e0e0;
  --color-holo-glow: rgba(255, 255, 255, 0.2);
  --color-holo-border: rgba(255, 255, 255, 0.1);
  --color-scan-line: rgba(255, 255, 255, 0.05);
  
  /* Holographic Effects */
  --glow-sm: 0 0 2px rgba(255, 255, 255, 0.1);
  --glow-md: 0 0 4px rgba(255, 255, 255, 0.15);
  --glow-lg: 0 0 8px rgba(255, 255, 255, 0.2);
  --glow-xl: 0 0 16px rgba(255, 255, 255, 0.25);
  
  /* Grid and Pattern Effects */
  --grid-pattern: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  --grid-size: 20px 20px;
  
  /* Modern Effects */
  --modern-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --modern-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --modern-shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --modern-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  
  /* Glass Morphism */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-blur: blur(12px);
  --glass-highlight: rgba(255, 255, 255, 0.25);
  
  /* Gradient Systems */
  --gradient-primary: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  --gradient-surface: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  --gradient-hover: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08));
  --gradient-active: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  
  /* Advanced Holographic */
  --holo-shimmer: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
  --holo-reflection: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  --holo-depth: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1);
  
  /* Micro-interactions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --transition-elastic: all 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);

  --font-size: 14px;
  --background: var(--color-pure-white);
  --foreground: var(--color-carbon-black);
  --card: var(--color-pure-white);
  --card-foreground: var(--color-carbon-black);
  --popover: var(--color-pure-white);
  --popover-foreground: var(--color-carbon-black);
  --primary: var(--color-carbon-black);
  --primary-foreground: var(--color-pure-white);
  --secondary: var(--color-light-silver);
  --secondary-foreground: var(--color-carbon-black);
  --muted: var(--color-light-silver);
  --muted-foreground: var(--color-steel-gray);
  --accent: var(--color-light-silver);
  --accent-foreground: var(--color-carbon-black);
  --destructive: #dc2626;
  --destructive-foreground: var(--color-pure-white);
  --border: var(--color-holo-border);
  --input: transparent;
  --input-background: var(--color-pure-white);
  --switch-background: var(--color-light-silver);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: var(--color-holo-primary);
  --chart-1: var(--color-carbon-black);
  --chart-2: var(--color-gunmetal);
  --chart-3: var(--color-steel-gray);
  --chart-4: var(--color-silver-mist);
  --chart-5: var(--color-light-silver);
  --radius: 0.375rem;
  --sidebar: var(--color-pure-white);
  --sidebar-foreground: var(--color-carbon-black);
  --sidebar-primary: var(--color-carbon-black);
  --sidebar-primary-foreground: var(--color-pure-white);
  --sidebar-accent: var(--color-light-silver);
  --sidebar-accent-foreground: var(--color-carbon-black);
  --sidebar-border: var(--color-holo-border);
  --sidebar-ring: var(--color-holo-primary);
}

.dark {
  --background: var(--color-void-black);
  --foreground: var(--color-pure-white);
  --card: var(--color-deep-black);
  --card-foreground: var(--color-pure-white);
  --popover: var(--color-deep-black);
  --popover-foreground: var(--color-pure-white);
  --primary: var(--color-pure-white);
  --primary-foreground: var(--color-void-black);
  --secondary: var(--color-carbon-black);
  --secondary-foreground: var(--color-pure-white);
  --muted: var(--color-carbon-black);
  --muted-foreground: var(--color-silver-mist);
  --accent: var(--color-carbon-black);
  --accent-foreground: var(--color-pure-white);
  --destructive: #ef4444;
  --destructive-foreground: var(--color-pure-white);
  --border: var(--color-holo-border);
  --input: var(--color-deep-black);
  --ring: var(--color-holo-primary);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: var(--color-pure-white);
  --chart-2: var(--color-light-silver);
  --chart-3: var(--color-silver-mist);
  --chart-4: var(--color-steel-gray);
  --chart-5: var(--color-gunmetal);
  --sidebar: var(--color-void-black);
  --sidebar-foreground: var(--color-pure-white);
  --sidebar-primary: var(--color-pure-white);
  --sidebar-primary-foreground: var(--color-void-black);
  --sidebar-accent: var(--color-carbon-black);
  --sidebar-accent-foreground: var(--color-pure-white);
  --sidebar-border: var(--color-holo-border);
  --sidebar-ring: var(--color-holo-primary);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    background-image: var(--grid-pattern);
    background-size: var(--grid-size);
    background-attachment: fixed;
  }

  /* Holographic Effects */
  .holo-glow {
    box-shadow: var(--glow-md);
  }

  .holo-glow-lg {
    box-shadow: var(--glow-lg);
  }

  .holo-border {
    border: 1px solid var(--color-holo-border);
    box-shadow: inset 0 1px 0 var(--color-holo-glow);
  }

  .holo-card {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(10px);
    border: 1px solid var(--color-holo-border);
    box-shadow: var(--glow-sm), inset 0 1px 0 var(--color-holo-glow);
  }

  .scan-line {
    position: relative;
    overflow: hidden;
  }

  .scan-line::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      var(--color-scan-line), 
      transparent
    );
    animation: scan 3s linear infinite;
  }

  @keyframes scan {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .geometric-accent {
    position: relative;
  }

  .geometric-accent::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      var(--color-holo-border), 
      transparent
    );
  }

  .geometric-accent::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      var(--color-holo-border), 
      transparent
    );
  }

  /* Glass Morphism Components */
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }

  .dark .glass-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--modern-shadow-lg), var(--holo-depth);
  }

  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--glass-highlight);
    opacity: 0.6;
  }

  /* Light mode glass effects */
  .glass-surface {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }

  .glass-button {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Dark mode glass effects */
  .dark .glass-surface {
    background: var(--gradient-surface);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
  }

  .dark .glass-button {
    background: var(--gradient-primary);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--modern-shadow-lg);
  }

  .glass-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--holo-shimmer);
    transition: left 0.6s ease;
  }

  .glass-button:hover::before {
    left: 100%;
  }

  .glass-button:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .glass-button:active {
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(0) scale(0.98);
  }

  .dark .glass-button:hover {
    background: var(--gradient-hover);
    transform: translateY(-1px) scale(1.02);
    box-shadow: var(--modern-shadow-xl), var(--glow-lg);
  }

  .dark .glass-button:active {
    background: var(--gradient-active);
    transform: translateY(0) scale(0.98);
  }

  /* Modern Design Utilities */
  .modern-button {
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }

  .modern-button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    transition: width 0.4s ease, height 0.4s ease;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    pointer-events: none;
  }

  .modern-button:active::after {
    width: 300px;
    height: 300px;
  }

  .modern-button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--modern-shadow-lg);
  }

  .modern-button:active {
    transform: translateY(0) scale(0.98);
    transition: transform 0.1s ease;
  }

  .modern-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--modern-shadow);
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }

  .modern-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--holo-reflection);
  }

  .dark .modern-card {
    background: rgba(26, 26, 26, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .modern-hover {
    transition: var(--transition-smooth);
    cursor: pointer;
  }

  .modern-hover:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: var(--modern-shadow-xl);
  }

  .modern-hover:active {
    transform: translateY(-1px) scale(0.99);
    transition: transform 0.1s ease;
  }

  .modern-input-focus {
    transition: var(--transition-smooth);
    position: relative;
  }

  .modern-input-focus:focus-within {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1), var(--glow-lg);
    transform: scale(1.01);
  }

  .modern-input-focus:focus-within::before {
    opacity: 1;
  }

  .modern-input-focus::before {
    content: '';
    position: absolute;
    inset: -1px;
    padding: 1px;
    background: var(--holo-shimmer);
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .holo-glow-none {
    box-shadow: none;
  }

  /* Advanced Animations */
  @keyframes modern-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.02); }
  }

  @keyframes modern-bounce {
    0%, 20%, 53%, 80%, 100% { 
      transform: translate3d(0,0,0) scale(1); 
    }
    40%, 43% { 
      transform: translate3d(0, -8px, 0) scale(1.02); 
    }
    70% { 
      transform: translate3d(0, -4px, 0) scale(1.01); 
    }
    90% { 
      transform: translate3d(0, -2px, 0) scale(1.005); 
    }
  }

  @keyframes smooth-fade-in {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.95);
      filter: blur(2px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(300%) rotate(45deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: var(--glow-sm); }
    50% { box-shadow: var(--glow-lg); }
  }

  @keyframes holographic-shift {
    0% { 
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
    50% { 
      background-position: 100% 50%;
      filter: hue-rotate(180deg);
    }
    100% { 
      background-position: 0% 50%;
      filter: hue-rotate(360deg);
    }
  }

  @keyframes data-flow {
    0% { 
      transform: translateX(-100%) scaleX(0);
      opacity: 0;
    }
    50% { 
      transform: translateX(0%) scaleX(1);
      opacity: 1;
    }
    100% { 
      transform: translateX(100%) scaleX(0);
      opacity: 0;
    }
  }

  @keyframes typing-dots {
    0% { transform: translateY(0px); opacity: 0.4; }
    28% { transform: translateY(-4px); opacity: 1; }
    44% { transform: translateY(0px); opacity: 0.4; }
  }

  /* Animation Classes */
  .animate-modern-pulse {
    animation: modern-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-modern-bounce {
    animation: modern-bounce 1s infinite;
  }

  .animate-smooth-fade-in {
    animation: smooth-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-shimmer {
    animation: shimmer 2.5s ease-in-out infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .animate-holographic {
    animation: holographic-shift 8s ease-in-out infinite;
    background-size: 200% 200%;
  }

  .animate-data-flow {
    animation: data-flow 3s ease-in-out infinite;
  }

  .animate-typing-dots {
    animation: typing-dots 1.4s ease-in-out infinite;
  }

  .animate-typing-dots:nth-child(2) {
    animation-delay: 0.2s;
  }

  .animate-typing-dots:nth-child(3) {
    animation-delay: 0.4s;
  }

  /* Interactive States */
  .interactive-scale {
    transition: var(--transition-smooth);
  }

  .interactive-scale:hover {
    transform: scale(1.05);
  }

  .interactive-scale:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }

  .interactive-lift {
    transition: var(--transition-smooth);
  }

  .interactive-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--modern-shadow-xl);
  }

  .interactive-lift:active {
    transform: translateY(-1px);
    transition: transform 0.1s ease;
  }

  .interactive-glow {
    transition: var(--transition-smooth);
  }

  .interactive-glow:hover {
    box-shadow: var(--glow-lg), var(--modern-shadow-lg);
  }

  /* Skeleton Loading */
  .skeleton {
    background: linear-gradient(90deg, 
      rgba(255,255,255,0.1) 25%, 
      rgba(255,255,255,0.2) 50%, 
      rgba(255,255,255,0.1) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    border-radius: 0.375rem;
  }

  .dark .skeleton {
    background: linear-gradient(90deg, 
      rgba(42,42,42,0.8) 25%, 
      rgba(58,58,58,0.9) 50%, 
      rgba(42,42,42,0.8) 75%
    );
  }

  /* Advanced Text Effects */
  .text-gradient {
    background: linear-gradient(135deg, 
      var(--color-holo-primary), 
      rgba(255, 255, 255, 0.8),
      var(--color-holo-primary)
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: holographic-shift 6s ease-in-out infinite;
  }

  /* Light mode holographic text */
  .text-holographic {
    background: linear-gradient(45deg, 
      var(--color-carbon-black), 
      var(--color-steel-gray), 
      var(--color-carbon-black), 
      var(--color-gunmetal),
      var(--color-carbon-black)
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: holographic-shift 4s ease-in-out infinite;
  }

  /* Dark mode holographic text */
  .dark .text-holographic {
    background: linear-gradient(45deg, 
      #ffffff, 
      #e0e0e0, 
      #ffffff, 
      #c0c0c0,
      #ffffff
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: holographic-shift 4s ease-in-out infinite;
  }

  .text-shimmer {
    position: relative;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.8), 
      rgba(255,255,255,1),
      rgba(255,255,255,0.8)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .text-shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255,255,255,0.4), 
      transparent
    );
    animation: shimmer 3s ease-in-out infinite;
  }

  .scrollbar-modern {
    scrollbar-width: thin;
    scrollbar-color: var(--color-holo-primary) transparent;
  }

  .scrollbar-modern::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-modern::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-modern::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .scrollbar-modern::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  /* Enhanced Visual States */
  .state-loading {
    position: relative;
    overflow: hidden;
  }

  .state-loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255,255,255,0.1), 
      transparent
    );
    animation: shimmer 2s ease-in-out infinite;
  }

  .state-success {
    background: linear-gradient(135deg, 
      rgba(34, 197, 94, 0.1), 
      rgba(34, 197, 94, 0.05)
    );
    border: 1px solid rgba(34, 197, 94, 0.2);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
  }

  .state-warning {
    background: linear-gradient(135deg, 
      rgba(251, 146, 60, 0.1), 
      rgba(251, 146, 60, 0.05)
    );
    border: 1px solid rgba(251, 146, 60, 0.2);
    box-shadow: 0 0 20px rgba(251, 146, 60, 0.1);
  }

  .state-error {
    background: linear-gradient(135deg, 
      rgba(239, 68, 68, 0.1), 
      rgba(239, 68, 68, 0.05)
    );
    border: 1px solid rgba(239, 68, 68, 0.2);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
  }

  /* Depth and Layering */
  .layer-base {
    z-index: 1;
  }

  .layer-elevated {
    z-index: 10;
  }

  .layer-floating {
    z-index: 20;
  }

  .layer-modal {
    z-index: 50;
  }

  .layer-tooltip {
    z-index: 60;
  }

  /* Premium Visual Effects */
  .effect-noise {
    position: relative;
  }

  .effect-noise::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 25px 25px, rgba(255,255,255,0.02) 2%, transparent 2%),
      radial-gradient(circle at 75px 75px, rgba(255,255,255,0.02) 2%, transparent 2%);
    background-size: 50px 50px;
    background-position: 0 0, 25px 25px;
    pointer-events: none;
  }

  .effect-grid {
    background-image: 
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .effect-dots {
    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 15px 15px;
  }
}

/**
 * Base typography. This is not applied to elements which have an ancestor with a Tailwind text class.
 */
@layer base {
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    p {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }

    label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    button {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    input {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }
  }
}

html {
  font-size: var(--font-size);
}