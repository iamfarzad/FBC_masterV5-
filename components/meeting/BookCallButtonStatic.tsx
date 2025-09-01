import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface BookCallButtonStaticProps extends React.ComponentProps<typeof Button> {
  title?: string
}

export function BookCallButtonStatic({
  children,
  title,
  ...rest
}: BookCallButtonStaticProps) {
  return (
    <Button {...rest}>
      <span>
        {children ?? 'Book a Call'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </span>
    </Button>
  )
}

export default BookCallButtonStatic
