"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, FileText, CheckCircle } from 'lucide-react'

interface ModuleRendererProps {
  module: {
    title: string
    description: string
    lessons: Array<{
      title: string
      duration: string
      completed?: boolean
    }>
    level: string
  }
}

function ModuleRenderer({ module }: ModuleRendererProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <Badge variant="outline">{module.level}</Badge>
          </div>
          <p className="text-muted-foreground">{module.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {module.lessons.map((lesson, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {lesson.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Play className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {lesson.completed ? 'Review' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModuleRenderer
