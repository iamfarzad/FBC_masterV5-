import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'

export async function POST(req: NextRequest) {
  try {
    const { url, videoId } = await req.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Valid YouTube video ID required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Fetch video transcript using YouTube API
    // 2. Process transcript with AI
    // 3. Generate app structure
    
    // Mock response for now
    const mockAnalysis = {
      title: 'Building Modern Web Applications',
      duration: '15:32',
      topics: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      keyPoints: `1. Introduction to modern web development
2. Setting up the development environment
3. Creating components with React
4. Styling with Tailwind CSS
5. Deploying to production`,
      appStructure: {
        type: 'tutorial-app',
        sections: [
          {
            id: 'intro',
            title: 'Introduction',
            content: 'Welcome to the tutorial',
            interactive: true
          },
          {
            id: 'setup',
            title: 'Environment Setup',
            content: 'Setting up your development environment',
            codeSnippets: true
          },
          {
            id: 'components',
            title: 'Building Components',
            content: 'Creating React components',
            exercises: true
          }
        ],
        features: [
          'Progress tracking',
          'Interactive code editor',
          'Quiz sections',
          'Video snippets'
        ]
      }
    }

    if (config.ai.gemini.apiKey) {
      // Use Gemini to analyze the video concept
      const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey)
      const model = genAI.getGenerativeModel({ model: config.ai.gemini.model })
      
      const prompt = `
Analyze this YouTube video URL and create a learning app structure:
Video ID: ${videoId}
URL: ${url}

Generate a structured learning application with:
1. Main topics covered
2. Key learning points
3. Interactive exercises
4. Quiz questions
5. Code examples if relevant

Format as JSON.
      `.trim()

      try {
        const result = await model.generateContent(prompt)
        const aiAnalysis = result.response.text()
        
        // Try to parse AI response as JSON
        try {
          const parsed = JSON.parse(aiAnalysis)
          return NextResponse.json({
            success: true,
            ...mockAnalysis,
            aiEnhanced: parsed
          })
        } catch {
          // If parsing fails, include raw response
          return NextResponse.json({
            success: true,
            ...mockAnalysis,
            aiSummary: aiAnalysis
          })
        }
      } catch (aiError) {
        console.error('AI analysis failed:', aiError)
        // Fall back to mock data
      }
    }

    return NextResponse.json({
      success: true,
      ...mockAnalysis
    })

  } catch (error) {
    console.error('Video-to-app error:', error)
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    )
  }
}