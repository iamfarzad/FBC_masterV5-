"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { AlertTriangle, Info } from 'lucide-react'

const biasExamples = [
  { id: 'gender', name: 'Gender Bias', prompt: 'The doctor walked into the room and she...', response: '...quickly reviewed the chart...', alternatePrompt: 'The nurse walked into the room and he...', alternateResponse: '...checked the vital signs...', analysis: 'Tests for gender bias in roles.' },
  { id: 'race', name: 'Racial Bias', prompt: 'Describe a CEO of a Fortune 500 company.', response: 'A highly experienced business leader...', alternatePrompt: 'Describe a criminal.', alternateResponse: 'Someone who has committed a crime...', analysis: 'Avoids stereotyping in role descriptions.' },
]

export default function BiasExplorer() {
  const [activeTab, setActiveTab] = useState('gender')
  const [fairness, setFairness] = useState(70)
  const ex = biasExamples.find((x) => x.id === activeTab)!

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div className="mb-8 w-full max-w-4xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">Bias & Ethics Explorer</h2>
          <p className="text-xl text-muted-foreground">Examine bias patterns and mitigation strategies</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="gender" value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6 flex justify-center"><TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="gender">Gender</TabsTrigger><TabsTrigger value="race">Race</TabsTrigger></TabsList></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card><CardHeader><CardTitle>Prompt</CardTitle></CardHeader><CardContent><div className="bg-muted/30 mb-4 rounded-md p-4">{ex.prompt}</div><div className="bg-muted/30 rounded-md p-4">{ex.alternatePrompt}</div></CardContent></Card>
                <Card><CardHeader><CardTitle>Response</CardTitle></CardHeader><CardContent className="space-y-4"><div className="bg-muted/30 rounded-md p-4">{ex.response}</div><div className="bg-muted/30 rounded-md p-4">{ex.alternateResponse}</div><div className="space-y-2"><div className="flex justify-between text-sm"><span>Fairness Filter Strength</span><span>{fairness}%</span></div><Slider value={[fairness]} min={0} max={100} step={10} onValueChange={(v) => setFairness(v[0]!)} /></div></CardContent></Card>
              </motion.div>
              <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card><CardHeader><CardTitle>Bias Analysis</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-5 text-yellow-500" /><div><h4 className="font-medium">Potential Bias</h4><p className="text-sm text-muted-foreground">{ex.analysis}</p></div></div><div className="bg-muted/30 space-y-2 rounded-md p-4"><h4 className="font-medium">Mitigation</h4><ul className="list-disc pl-5 text-sm"><li>Balanced examples</li><li>Avoid stereotypes</li><li>Counterfactual testing</li></ul></div></CardContent></Card>
                <Card><CardHeader><CardTitle>Why This Matters</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex items-start gap-2"><Info className="mt-0.5 size-5 text-blue-500" /><p className="text-sm text-muted-foreground">AI systems can reflect societal biases; design consciously for fairness.</p></div></CardContent></Card>
              </motion.div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


