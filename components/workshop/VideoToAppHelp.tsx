'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, Video, Code, Wand2, ExternalLink } from 'lucide-react'

export function VideoToAppHelp() {
  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="size-5 text-accent" />
          How Video to App Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-accent/10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
              <Video className="size-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">1. Video Analysis</div>
              <div className="text-xs text-muted-foreground">
                AI extracts transcript and key concepts from YouTube video
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-accent/10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
              <Wand2 className="size-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">2. App Specification</div>
              <div className="text-xs text-muted-foreground">
                Generates detailed app blueprint based on video content
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-accent/10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
              <Code className="size-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">3. Code Generation</div>
              <div className="text-xs text-muted-foreground">
                Creates interactive HTML/JS app implementing the concepts
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-accent/10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
              <ExternalLink className="size-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">4. Preview & Download</div>
              <div className="text-xs text-muted-foreground">
                Test the generated app and download the code
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="mb-2 text-sm font-medium">Supported Video Types:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">Tutorials</Badge>
            <Badge variant="outline" className="text-xs">Demos</Badge>
            <Badge variant="outline" className="text-xs">Presentations</Badge>
            <Badge variant="outline" className="text-xs">Educational Content</Badge>
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-2 text-sm font-medium">Example URLs:</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• Business process tutorials</div>
            <div>• Software demonstrations</div>
            <div>• Educational explainer videos</div>
            <div>• Product feature walkthroughs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VideoToAppHelp
