import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Camera, 
  Monitor, 
  Video, 
  FileText, 
  Mic,
  Globe,
  Code,
  BarChart3,
  ArrowRight
} from 'lucide-react'

const tools = [
  {
    id: 'roi-calculator',
    title: 'ROI Calculator',
    description: 'Advanced return on investment calculations with AI-powered insights',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500',
    href: '/tools/roi-calculator'
  },
  {
    id: 'webcam-ai',
    title: 'Webcam AI',
    description: 'Real-time image capture and AI analysis',
    icon: Camera,
    color: 'from-blue-500 to-cyan-500',
    href: '/tools/webcam'
  },
  {
    id: 'screen-analyzer',
    title: 'Screen Analyzer',
    description: 'Capture and analyze your screen with AI',
    icon: Monitor,
    color: 'from-purple-500 to-pink-500',
    href: '/tools/screen-share'
  },
  {
    id: 'video-to-app',
    title: 'Video to App',
    description: 'Convert videos into functional applications',
    icon: Video,
    color: 'from-red-500 to-orange-500',
    href: '/tools/video-to-app'
  },
  {
    id: 'document-processor',
    title: 'Document AI',
    description: 'Process and analyze documents with advanced AI',
    icon: FileText,
    color: 'from-indigo-500 to-blue-500',
    href: '/tools/document'
  },
  {
    id: 'voice-assistant',
    title: 'Voice Assistant',
    description: 'Speech recognition and voice synthesis',
    icon: Mic,
    color: 'from-yellow-500 to-amber-500',
    href: '/tools/voice'
  },
  {
    id: 'web-scraper',
    title: 'Web Scraper',
    description: 'Extract and analyze data from websites',
    icon: Globe,
    color: 'from-teal-500 to-cyan-500',
    href: '/tools/web-scraper'
  },
  {
    id: 'code-generator',
    title: 'Code Generator',
    description: 'Generate and analyze code with AI',
    icon: Code,
    color: 'from-gray-500 to-slate-500',
    href: '/tools/code'
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Visualize and analyze your data',
    icon: BarChart3,
    color: 'from-pink-500 to-rose-500',
    href: '/tools/analytics'
  }
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-space-grotesk text-gradient">
            AI-Powered Tools
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our suite of advanced AI tools designed to enhance productivity and unlock new possibilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="group hover-lift glass-dark border-gray-800">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} p-2.5 mb-4`}>
                  <tool.icon className="w-full h-full text-white" />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600">
                    Launch Tool
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}