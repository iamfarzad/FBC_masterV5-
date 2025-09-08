import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-bg/50 to-bg/30 p-4">
      <Card className="w-full max-w-md border border-border bg-surface/95 shadow-xl backdrop-blur-lg">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-accent to-orange-accent-hover">
            <Search className="size-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-text">
            Page Not Found
          </CardTitle>
          <p className="mt-2 text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            The page might have been moved, deleted, or you entered the wrong URL.
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-gradient-to-r from-orange-accent to-orange-accent-hover text-white hover:from-orange-accent-hover hover:to-orange-accent">
              <Link href="/">
                <Home className="mr-2 size-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/chat">
                <ArrowLeft className="mr-2 size-4" />
                Back to Chat
              </Link>
            </Button>
          </div>
          <div className="border-t border-border pt-4 text-center text-xs text-text-muted">
            Error 404
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
