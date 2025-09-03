import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Video, Calculator, Brain, ArrowRight } from 'lucide-react'

export default function WorkshopPage() {
  const modules = [
    {
      id: 1,
      title: 'Introduction to AI',
      description: 'Learn the fundamentals of artificial intelligence and machine learning',
      icon: Brain,
      duration: '15 min',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'AI in Business',
      description: 'Discover how AI can transform your business operations',
      icon: Calculator,
      duration: '20 min',
      level: 'Intermediate'
    },
    {
      id: 3,
      title: 'Video AI Applications',
      description: 'Explore AI applications in video processing and analysis',
      icon: Video,
      duration: '25 min',
      level: 'Advanced'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            AI Learning Workshop
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Master artificial intelligence through interactive modules and hands-on exercises
          </p>
          <Button asChild size="lg">
            <Link href="/chat">Back to Chat</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-blue-600 mb-2">3</h3>
              <p className="text-gray-600 dark:text-gray-300">Learning Modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-green-600 mb-2">60</h3>
              <p className="text-gray-600 dark:text-gray-300">Minutes of Content</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">100%</h3>
              <p className="text-gray-600 dark:text-gray-300">Interactive</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <module.icon className="h-6 w-6 text-primary" />
                  {module.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {module.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {module.level}
                  </span>
                  <span className="text-sm text-gray-500">{module.duration}</span>
                </div>
                <Button className="w-full" variant="outline">
                  Start Module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}