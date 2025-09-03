import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight">F.B/c</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Advanced AI Platform
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/chat">Enter Chat</Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button asChild variant="outline">
              <Link href="/workshop">Workshop</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tools">Tools</Link>
            </Button>
          </div>
        </div>
        
        <div className="pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Version 2.0
          </p>
        </div>
      </div>
    </div>
  )
}