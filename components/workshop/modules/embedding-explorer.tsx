"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sampleEmbeddings: Record<string, [number, number]> = {
  king: [0.7, 0.8], queen: [0.65, 0.6], man: [0.5, 0.85], woman: [0.45, 0.65],
  doctor: [0.3, 0.4], nurse: [0.25, 0.3], programmer: [0.1, 0.7], teacher: [0.15, 0.5],
  dog: [-0.6, 0.3], cat: [-0.5, 0.2], animal: [-0.7, 0.5], pet: [-0.55, 0.4],
  car: [-0.2, -0.6], vehicle: [-0.3, -0.5], bus: [-0.25, -0.7], train: [-0.35, -0.65],
  happy: [0.4, -0.3], sad: [0.3, -0.4], angry: [0.5, -0.5], joyful: [0.45, -0.25],
}

export default function EmbeddingExplorer() {
  const [selectedWords, setSelectedWords] = useState<string[]>(["king", "queen", "man", "woman"])
  const [searchTerm, setSearchTerm] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showRelationships, setShowRelationships] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const centerX = canvas.width / 2, centerY = canvas.height / 2, scale = 200 * zoomLevel
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || "hsl(var(--border))"; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height); ctx.stroke()
    selectedWords.forEach((word) => {
      const embedding = sampleEmbeddings[word]; if (!embedding) return
      const x = centerX + embedding[0] * scale; const y = centerY - embedding[1] * scale
      const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || "hsl(var(--brand))"
      const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || "hsl(var(--text-muted))"
      const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || "hsl(var(--text))"
      ctx.fillStyle = word === selectedWord ? brandColor : mutedColor; ctx.beginPath(); ctx.arc(x, y, word === selectedWord ? 8 : 6, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = word === selectedWord ? brandColor : textColor; ctx.font = word === selectedWord ? "bold 14px sans-serif" : "12px sans-serif"; ctx.textAlign = "center"; ctx.fillText(word, x, y - 15)
    })
    if (showRelationships && selectedWord) {
      const selectedEmbedding = sampleEmbeddings[selectedWord]
      if (selectedEmbedding) {
        const selectedX = centerX + selectedEmbedding[0] * scale; const selectedY = centerY - selectedEmbedding[1] * scale
        selectedWords.forEach((word) => {
          if (word === selectedWord) return
          const embedding = sampleEmbeddings[word]; if (!embedding) return
          const x = centerX + embedding[0] * scale; const y = centerY - embedding[1] * scale
          const dx = selectedEmbedding[0] - embedding[0]; const dy = selectedEmbedding[1] - embedding[1]
          const distance = Math.sqrt(dx * dx + dy * dy)
          const opacity = Math.max(0, 1 - distance)
          ctx.strokeStyle = `hsla(var(--brand), ${opacity.toFixed(2)})`; ctx.lineWidth = 2 * opacity
          ctx.beginPath(); ctx.moveTo(selectedX, selectedY); ctx.lineTo(x, y); ctx.stroke()
          const midX = (selectedX + x) / 2; const midY = (selectedY + y) / 2
          ctx.fillStyle = brandColor; ctx.font = "10px sans-serif"; ctx.textAlign = "center"; ctx.fillText((1 - distance).toFixed(2), midX, midY - 5)
        })
      }
    }
  }, [selectedWords, zoomLevel, showRelationships, selectedWord])

  const handleAddWord = () => {
    if (searchTerm && !selectedWords.includes(searchTerm) && sampleEmbeddings[searchTerm]) {
      setSelectedWords([...selectedWords, searchTerm]); setSearchTerm("")
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <motion.div className="max-w-3xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">Embedding Explorer</h2>
          <p className="text-xl text-muted-foreground">Visualize how words and concepts are represented in vector space</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div className="bg-card border rounded-xl p-6 shadow-sm h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium">Vector Space Visualization</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={showRelationships ? "default" : "outline"} onClick={() => setShowRelationships(!showRelationships)}>
                      {showRelationships ? "Hide Relationships" : "Show Relationships"}
                    </Button>
                  </div>
                </div>
                <div className="relative h-[400px] mb-4 bg-muted/30 rounded-lg overflow-hidden">
                  <canvas ref={canvasRef} width={800} height={600} className="w-full h-full" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span>Zoom Level</span><span>{zoomLevel.toFixed(1)}x</span></div>
                    <Slider value={[zoomLevel]} min={0.5} max={2} step={0.1} onValueChange={(v) => setZoomLevel(v[0])} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedWords.map((word) => (
                      <div key={word} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer ${word === selectedWord ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'}`} onClick={() => setSelectedWord(word === selectedWord ? null : word)}>
                        {word}
                        <button className="ml-1 text-xs opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setSelectedWords(selectedWords.filter((w) => w !== word)); if (selectedWord === word) setSelectedWord(null) }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="bg-card border rounded-xl p-6 shadow-sm h-full">
                <h3 className="text-xl font-medium mb-4">Controls</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add Word</label>
                    <div className="flex gap-2">
                      <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter a word" className="flex-1" />
                      <Button onClick={handleAddWord}>Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Try: king, queen, man, woman, dog, cat, car, happy, sad</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preset Word Groups</label>
                    <Select onValueChange={(preset) => {
                      if (preset === 'gender') setSelectedWords(['king','queen','man','woman','boy','girl'])
                      if (preset === 'animals') setSelectedWords(['dog','cat','animal','pet'])
                      if (preset === 'transport') setSelectedWords(['car','bus','train','vehicle'])
                      if (preset === 'emotions') setSelectedWords(['happy','sad','angry','joyful'])
                      if (preset === 'professions') setSelectedWords(['doctor','nurse','programmer','teacher'])
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select a preset" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gender">Gender & Royalty</SelectItem>
                        <SelectItem value="animals">Animals</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                        <SelectItem value="emotions">Emotions</SelectItem>
                        <SelectItem value="professions">Professions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">About Embeddings</h4>
                    <p className="text-sm text-muted-foreground">Embeddings are vector representations of words or concepts in a high-dimensional space. Words with similar meanings are positioned closer together.</p>
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


