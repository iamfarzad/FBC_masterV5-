import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-light-silver/30 dark:from-gunmetal dark:via-gunmetal dark:to-gunmetal-lighter flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 dark:bg-gunmetal/95 backdrop-blur-lg border border-light-silver-darker dark:border-gunmetal-lighter shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-accent to-orange-accent-hover rounded-2xl flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gunmetal dark:text-light-silver">
            Page Not Found
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            The page might have been moved, deleted, or you entered the wrong URL.
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-gradient-to-r from-orange-accent to-orange-accent-hover hover:from-orange-accent-hover hover:to-orange-accent text-white">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/chat">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Link>
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-light-silver-darker dark:border-gunmetal-lighter">
            Error 404
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
