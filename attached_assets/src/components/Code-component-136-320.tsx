import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Zap, Calendar, FileText, MessageCircle } from 'lucide-react';

interface SuggestionCluster {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestions: string[];
  color: string;
  priority: number;
}

interface SmartSuggestionClusterProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  conversationStage: string;
  className?: string;
}

export const SmartSuggestionCluster: React.FC<SmartSuggestionClusterProps> = ({
  suggestions,
  onSuggestionClick,
  conversationStage,
  className = ""
}) => {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  // Intelligently categorize suggestions
  const categorizeSuggestions = (suggestions: string[]): SuggestionCluster[] => {
    const clusters: SuggestionCluster[] = [];
    
    const actionSuggestions = suggestions.filter(s => 
      s.toLowerCase().includes('schedule') || 
      s.toLowerCase().includes('book') || 
      s.toLowerCase().includes('call')
    );
    
    const infoSuggestions = suggestions.filter(s => 
      s.toLowerCase().includes('tell me') || 
      s.toLowerCase().includes('what') || 
      s.toLowerCase().includes('how')
    );
    
    const personalSuggestions = suggestions.filter(s => 
      s.toLowerCase().includes('my name') || 
      s.toLowerCase().includes('i am') || 
      s.toLowerCase().includes('we need')
    );
    
    const otherSuggestions = suggestions.filter(s => 
      !actionSuggestions.includes(s) && 
      !infoSuggestions.includes(s) && 
      !personalSuggestions.includes(s)
    );

    if (actionSuggestions.length > 0) {
      clusters.push({
        category: 'Actions',
        icon: Calendar,
        suggestions: actionSuggestions,
        color: 'text-green-400 border-green-400/30 bg-green-400/5',
        priority: 1
      });
    }

    if (infoSuggestions.length > 0) {
      clusters.push({
        category: 'Information',
        icon: FileText,
        suggestions: infoSuggestions,
        color: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
        priority: 2
      });
    }

    if (personalSuggestions.length > 0) {
      clusters.push({
        category: 'Personal',
        icon: MessageCircle,
        suggestions: personalSuggestions,
        color: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
        priority: 3
      });
    }

    if (otherSuggestions.length > 0) {
      clusters.push({
        category: 'Quick Replies',
        icon: Zap,
        suggestions: otherSuggestions,
        color: 'text-white/70 border-white/20 bg-white/5',
        priority: 4
      });
    }

    return clusters.sort((a, b) => a.priority - b.priority);
  };

  const clusters = categorizeSuggestions(suggestions);

  if (clusters.length === 0) return null;

  // If only one cluster with few items, show flat layout
  if (clusters.length === 1 && clusters[0].suggestions.length <= 3) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {clusters[0].suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="holo-border rounded-full px-4 py-2 text-sm hover:holo-glow transition-all duration-200 cursor-pointer text-left"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    );
  }

  // Show clustered layout
  return (
    <div className={`space-y-3 ${className}`}>
      {clusters.map((cluster, clusterIndex) => {
        const Icon = cluster.icon;
        const isExpanded = expandedCluster === cluster.category;
        
        return (
          <motion.div
            key={cluster.category}
            className="holo-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: clusterIndex * 0.1 }}
          >
            <motion.button
              onClick={() => setExpandedCluster(isExpanded ? null : cluster.category)}
              className={`w-full p-4 flex items-center justify-between hover:holo-glow transition-all duration-200 ${cluster.color}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg border border-current/20 bg-current/10">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{cluster.category}</div>
                  <div className="text-xs opacity-70">
                    {cluster.suggestions.length} option{cluster.suggestions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border/30"
                >
                  <div className="p-4 space-y-2">
                    {cluster.suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion)}
                        className="w-full text-left p-3 rounded-lg holo-border hover:holo-glow transition-all duration-200 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};