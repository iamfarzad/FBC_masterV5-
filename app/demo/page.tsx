import { RealtimeAIDemo } from '@/components/demo/RealtimeAIDemo'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <RealtimeAIDemo />
    </div>
  )
}

export const metadata = {
  title: 'F.B/c AI - Real-Time Demo',
  description: 'Experience enterprise-grade AI with Edge Function performance',
}
