"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const examples = [
  { id: "factual", prompt: "What is the capital of France?", response: "The capital of France is Paris.", analysis: { isHallucination: false, confidence: 0.98, explanation: "Correct factual response.", sources: ["Encyclopedia"] } },
  { id: "partial", prompt: "Who invented the telephone?", response: "Alexander Graham Bell in 1876; Meucci had earlier device.", analysis: { isHallucination: false, confidence: 0.85, explanation: "Acknowledges nuance.", sources: ["Patent records"] } },
  { id: "hallucination", prompt: "History of Mount Everest's underwater exploration.", response: "Everest underwater project discovered endemic species...", analysis: { isHallucination: true, confidence: 0.99, explanation: "Fabrication; Everest is not underwater.", sources: ["Geographic facts"] } },
]

export default function HallucinationChecker() {
  const [activeTab, setActiveTab] = useState("factual")
  const [prompt, setPrompt] = useState(examples[0].prompt)
  const [response, setResponse] = useState(examples[0].response)
  const [analysis, setAnalysis] = useState(examples[0].analysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [customResponse, setCustomResponse] = useState("")
  const [showCustomAnalysis, setShowCustomAnalysis] = useState(false)

  const handleTabChange = (value: string) => {
    const ex = examples.find(e => e.id === value)
    if (!ex) return
    setActiveTab(value); setPrompt(ex.prompt); setResponse(ex.response); setAnalysis(ex.analysis)
  }

  const handleAnalyzeCustom = () => {
    if (!customPrompt || !customResponse) return
    setIsAnalyzing(true)
    setTimeout(() => { setShowCustomAnalysis(true); setIsAnalyzing(false) }, 1200)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div className="mb-8 w-full max-w-4xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">Hallucination Detector</h2>
          <p className="text-xl text-muted-foreground">Learn to identify and mitigate AI hallucinations</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="factual" value={activeTab} onValueChange={handleTabChange}>
            <div className="mb-6 flex justify-center"><TabsList className="grid w-full max-w-xl grid-cols-4"><TabsTrigger value="factual">Factual</TabsTrigger><TabsTrigger value="partial">Partial Truth</TabsTrigger><TabsTrigger value="hallucination">Hallucination</TabsTrigger><TabsTrigger value="custom">Custom</TabsTrigger></TabsList></div>
            <TabsContent value="factual"><ExampleTab prompt={prompt} response={response} analysis={analysis} /></TabsContent>
            <TabsContent value="partial"><ExampleTab prompt={prompt} response={response} analysis={analysis} /></TabsContent>
            <TabsContent value="hallucination"><ExampleTab prompt={prompt} response={response} analysis={analysis} /></TabsContent>
            <TabsContent value="custom">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Card><CardHeader><CardTitle>Custom Input</CardTitle><CardDescription>Enter a prompt and response to analyze</CardDescription></CardHeader><CardContent className="space-y-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Prompt</label><Textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="min-h-[100px]" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Response</label><Textarea value={customResponse} onChange={(e) => setCustomResponse(e.target.value)} className="min-h-[150px]" /></div>
                    <Button className="w-full" onClick={handleAnalyzeCustom} disabled={isAnalyzing || !customPrompt || !customResponse}>{isAnalyzing ? 'Analyzing...' : 'Analyze Response'}</Button>
                  </CardContent></Card>
                </motion.div>
                <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <Card><CardHeader><CardTitle>Analysis</CardTitle><CardDescription>Hallucination detection results</CardDescription></CardHeader><CardContent>
                    {showCustomAnalysis ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-yellow-500" /><span className="font-medium">Potential hallucination detected</span></div>
                        <p className="text-sm text-muted-foreground">The response contains statements that cannot be verified or may be fabricated. Fact-check important claims.</p>
                      </div>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-muted-foreground">Enter a prompt and response, then click "Analyze Response"</div>
                    )}
                  </CardContent></Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ExampleTab({ prompt, response, analysis }: { prompt: string; response: string; analysis: { isHallucination: boolean; confidence: number; explanation: string; sources: string[] } }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card><CardHeader><CardTitle>Prompt</CardTitle></CardHeader><CardContent><div className="bg-muted/30 rounded-md p-4">{prompt}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Response</CardTitle></CardHeader><CardContent><div className="bg-muted/30 rounded-md p-4">{response}</div></CardContent></Card>
      </motion.div>
      <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card><CardHeader><CardTitle>Analysis</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center gap-2">{analysis.isHallucination ? (<><XCircle className="size-5 text-red-500" /><span className="font-medium">Hallucination Detected</span></>) : (<><CheckCircle className="size-5 text-green-500" /><span className="font-medium">Factually Accurate</span></>)}<span className="ml-auto text-sm text-muted-foreground">Confidence: {(analysis.confidence * 100).toFixed(0)}%</span></div>
          <div><h4 className="mb-2 font-medium">Explanation</h4><p className="text-sm text-muted-foreground">{analysis.explanation}</p></div>
        </CardContent></Card>
      </motion.div>
    </div>
  )
}


