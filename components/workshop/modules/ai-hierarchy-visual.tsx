"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from '@/src/core/utils'

const hierarchyLevels = [
  { id: "ai", name: "Artificial Intelligence", description: "Systems designed to mimic human intelligence and perform tasks that typically require human cognition.", examples: "Expert systems, game-playing AI, robotics, computer vision", color: "from-blue-500/20 to-blue-600/20", textColor: "text-blue-500", borderColor: "border-blue-500/30" },
  { id: "ml", name: "Machine Learning", description: "AI systems that learn patterns from data without being explicitly programmed with rules.", examples: "Linear regression, decision trees, neural networks, clustering algorithms", color: "from-purple-500/20 to-purple-600/20", textColor: "text-purple-500", borderColor: "border-purple-500/30" },
  { id: "genai", name: "Generative AI", description: "ML systems that create new content like text, images, music, or code based on patterns in training data.", examples: "GANs, VAEs, diffusion models, text-to-image models", color: "from-pink-500/20 to-pink-600/20", textColor: "text-pink-500", borderColor: "border-pink-500/30" },
  { id: "llm", name: "Large Language Models", description: "Generative AI systems trained on vast text data to understand and generate human language.", examples: "GPT-4, Claude, Gemini, Llama, Mistral", color: "from-orange-500/20 to-orange-600/20", textColor: "text-orange-500", borderColor: "border-orange-500/30" },
]

export default function AIHierarchyVisual() {
  const [activeLevel, setActiveLevel] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeLevel) {
      const timer = setTimeout(() => { setActiveLevel("ai") }, 1000)
      return () => clearTimeout(timer)
    }
  }, [activeLevel])

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <motion.div className="mb-8 w-full max-w-3xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">AI Hierarchy Visual</h2>
          <p className="text-xl text-muted-foreground">Explore the relationship between AI, Machine Learning, Generative AI, and LLMs</p>
        </motion.div>
        <div className="flex w-full max-w-5xl flex-col items-center gap-8 md:flex-row">
          <motion.div ref={containerRef} className="relative flex aspect-square w-full max-w-xl items-center justify-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            {hierarchyLevels.map((level, index) => {
              const size = 100 - index * 20
              const isActive = activeLevel === level.id
              return (
                <motion.div key={level.id} className={cn("absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", level.borderColor, isActive ? "z-20 shadow-lg" : "z-10")} style={{ width: `${size}%`, height: `${size}%` }} onClick={() => { setActiveLevel(level.id); setShowExamples(false) }} whileHover={{ scale: isActive ? 1.05 : 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3 }} role="button" aria-pressed={isActive} aria-label={`Select ${level.name}`} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setActiveLevel(level.id); setShowExamples(false); e.preventDefault() } }}>
                  <div className={cn("absolute inset-0 rounded-full bg-gradient-to-br", level.color, isActive ? "opacity-40" : "opacity-20")} />
                  <div className={cn("font-medium text-lg md:text-xl transition-all duration-300", level.textColor, isActive ? "scale-110" : "scale-100")}>{level.name}</div>
                </motion.div>
              )
            })}
            <div className="bg-primary/20 absolute flex size-4 items-center justify-center rounded-full"><div className="size-2 animate-pulse rounded-full bg-primary" /></div>
          </motion.div>
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {activeLevel ? (
                <motion.div key={activeLevel} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="rounded-xl border bg-card p-6 shadow-sm">
                  {(() => {
                    const level = hierarchyLevels.find((l) => l.id === activeLevel)
                    if (!level) return null
                    return (
                      <div>
                        <h3 className={cn("text-2xl font-bold mb-4", level.textColor)}>{level.name}</h3>
                        <p className="mb-4 text-lg">{level.description}</p>
                        <motion.div id={`examples-${level.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: showExamples ? "auto" : 0, opacity: showExamples ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                          <div className="border-t pt-4">
                            <h4 className="mb-2 font-medium">Examples:</h4>
                            <p className="text-muted-foreground">{level.examples}</p>
                          </div>
                        </motion.div>
                        <button onClick={() => setShowExamples(!showExamples)} className={cn("mt-4 text-sm flex items-center transition-colors", level.textColor, "hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1")} aria-expanded={showExamples} aria-controls={`examples-${level.id}`}>
                          {showExamples ? "Hide examples" : "Show examples"}
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`ml-1 transition-transform ${showExamples ? "rotate-180" : ""}`}>
                            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )
                  })()}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-6 text-center shadow-sm">
                  <p className="text-muted-foreground">Click on a layer to explore its details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}


