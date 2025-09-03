"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from '@/lib/utils'

const examples = [
  { id: "example1", sentence: "The cat sat on the mat because it was comfortable.", focusWord: "it", attentionScores: { The: 0.05, cat: 0.65, sat: 0.1, on: 0.05, the: 0.05, mat: 0.3, because: 0.1, it: 0.1, was: 0.2, comfortable: 0.4 }, explanation: "The model pays most attention to 'cat' (65%) when processing 'it', correctly identifying that 'it' refers to the cat, not the mat." },
  { id: "example2", sentence: "The cat sat on the mat because it was soft.", focusWord: "it", attentionScores: { The: 0.05, cat: 0.3, sat: 0.1, on: 0.05, the: 0.05, mat: 0.7, because: 0.1, it: 0.1, was: 0.2, soft: 0.4 }, explanation: "The model pays most attention to 'mat' (70%) when processing 'it', correctly identifying that 'it' refers to the mat in this context, not the cat." },
  { id: "example3", sentence: "The developers released the update after they fixed the bugs.", focusWord: "they", attentionScores: { The: 0.1, developers: 0.8, released: 0.2, the: 0.05, update: 0.1, after: 0.1, they: 0.1, fixed: 0.2, the: 0.05, bugs: 0.3 }, explanation: "The model pays most attention to 'developers' (80%) when processing 'they', correctly resolving the pronoun reference." },
]

export default function AttentionMechanismDemo() {
  const [activeExample, setActiveExample] = useState(examples[0])
  const [focusWord, setFocusWord] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const words = activeExample.sentence.split(/\s+/)

  useEffect(() => { setFocusWord(null); setShowExplanation(false); setIsAnimating(false) }, [activeExample])

  const handleStartAnimation = () => {
    setFocusWord(null); setShowExplanation(false); setIsAnimating(true)
    setTimeout(() => { setFocusWord(activeExample.focusWord); setTimeout(() => { setShowExplanation(true); setIsAnimating(false) }, 2000 / animationSpeed) }, 1000 / animationSpeed)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div className="mb-8 w-full max-w-4xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">Attention Mechanism Demo</h2>
          <p className="text-xl text-muted-foreground">Visualize how LLMs focus on different parts of text to understand context</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <motion.div className="rounded-xl border bg-card p-6 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-medium">Attention Visualization</h3>
                  <div className="flex gap-2">
                    {examples.map((example, index) => (
                      <Button key={example.id} variant={activeExample.id === example.id ? "default" : "outline"} size="sm" onClick={() => setActiveExample(example)} disabled={isAnimating}>Example {index + 1}</Button>
                    ))}
                  </div>
                </div>
                <div ref={containerRef} className="bg-muted/30 mb-6 flex min-h-[300px] flex-col items-center justify-center rounded-lg p-4">
                  <div className="mb-16 flex flex-wrap justify-center gap-2">
                    {words.map((word, index) => {
                      const isHighlightable = word === activeExample.focusWord
                      const isSelected = word === focusWord
                      const attentionScores = focusWord ? activeExample.attentionScores : null
                      return (
                        <div key={index} className="relative">
                          <motion.div className={cn("px-3 py-2 rounded-lg text-lg relative z-10 transition-colors", isHighlightable ? "cursor-pointer" : "cursor-default", isSelected ? "bg-info text-surface" : isHighlightable ? "bg-info/10 dark:bg-info/30" : "")} onClick={() => { if (isHighlightable && !isAnimating) { setFocusWord(isSelected ? null : word); setShowExplanation(false) } }} whileHover={isHighlightable && !isAnimating ? { scale: 1.05 } : {}} whileTap={isHighlightable && !isAnimating ? { scale: 0.95 } : {}}>
                            {word}
                          </motion.div>
                          {attentionScores && attentionScores[word] > 0.1 && (
                            <motion.div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform text-xs font-medium" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                              <span className={cn("px-1.5 py-0.5 rounded", attentionScores[word] > 0.5 ? "bg-info text-surface" : "bg-info/10 dark:bg-info/30")}>{(attentionScores[word] * 100).toFixed(0)}%</span>
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {focusWord && (
                    <div className="w-full">
                      <motion.div className="bg-info/50 mb-8 h-[2px] w-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }} />
                      {showExplanation && (
                        <motion.div className="mx-auto max-w-lg text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          <p className="text-lg">{activeExample.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span>Animation Speed</span><span>{animationSpeed}x</span></div>
                    <Slider value={[animationSpeed]} min={0.5} max={2} step={0.5} onValueChange={(v) => setAnimationSpeed(v[0])} disabled={isAnimating} />
                  </div>
                  <div className="flex justify-center"><Button onClick={handleStartAnimation} disabled={isAnimating} className="px-8">{isAnimating ? "Animating..." : "Run Animation"}</Button></div>
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="h-full rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-medium">About Attention</h3>
                <div className="space-y-4">
                  <p>Attention is a key mechanism in transformer models that allows them to focus on different parts of the input when generating each word of output.</p>
                  <div>
                    <h4 className="mb-2 font-medium">How it works:</h4>
                    <ol className="list-decimal space-y-2 pl-5 text-sm">
                      <li>For each word, the model calculates attention scores for all other words in the context.</li>
                      <li>Higher scores mean the model pays more attention to that word when processing the current word.</li>
                      <li>This helps resolve references (like pronouns) and understand relationships.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


