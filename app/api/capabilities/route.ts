import { NextRequest, NextResponse } from 'next/server'
import { 
  AI_CAPABILITIES, 
  CAPABILITY_CATEGORIES, 
  getAvailableCapabilities,
  getCapabilityByKeyword 
} from '@/src/core/intelligence/capability-registry'

/**
 * GET /api/capabilities
 * Returns available AI capabilities based on context
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = req.headers.get('x-intelligence-session-id')
    const action = searchParams.get('action')
    const keyword = searchParams.get('keyword')

    // Determine context for capability filtering
    const context = {
      hasSessionId: !!sessionId,
      hasUserEmail: !!searchParams.get('email'), 
      supportsMultimodal: true // Always true for this implementation
    }

    switch (action) {
      case 'search':
        if (!keyword) {
          return NextResponse.json({ 
            error: 'Missing keyword parameter for search' 
          }, { status: 400 })
        }
        
        const matches = getCapabilityByKeyword(keyword)
        return NextResponse.json({
          query: keyword,
          matches: matches.map(cap => ({
            id: cap.id,
            name: cap.name,
            description: cap.description,
            category: cap.category,
            examples: cap.examples.slice(0, 2) // Limit examples
          })),
          total: matches.length
        })

      case 'categories':
        return NextResponse.json({
          categories: Object.entries(CAPABILITY_CATEGORIES).map(([key, category]) => ({
            id: key,
            ...category,
            capabilities: Object.values(AI_CAPABILITIES)
              .filter(cap => cap.category === key)
              .map(cap => ({
                id: cap.id,
                name: cap.name,
                description: cap.description
              }))
          }))
        })

      default:
        // Return all available capabilities
        const available = getAvailableCapabilities(context)
        
        return NextResponse.json({
          capabilities: available.map(cap => ({
            id: cap.id,
            name: cap.name,
            description: cap.description,
            category: cap.category,
            availability: cap.availability,
            examples: cap.examples,
            apiEndpoint: cap.apiEndpoint,
            requirements: cap.requirements
          })),
          total: available.length,
          context: {
            hasSessionId: context.hasSessionId,
            hasUserEmail: context.hasUserEmail,
            supportsMultimodal: context.supportsMultimodal
          },
          lastUpdated: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('Capabilities API error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve capabilities',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST /api/capabilities  
 * For future capability discovery and dynamic updates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, capability, sessionId } = body

    switch (action) {
      case 'discover':
        // Future: Dynamic capability discovery based on user needs
        return NextResponse.json({
          message: 'Dynamic capability discovery not implemented yet',
          suggested: Object.keys(AI_CAPABILITIES).slice(0, 5)
        })

      case 'test':
        // Test if a capability is working
        const cap = AI_CAPABILITIES[capability]
        if (!cap) {
          return NextResponse.json({ 
            error: `Unknown capability: ${capability}` 
          }, { status: 400 })
        }

        return NextResponse.json({
          capability: cap.name,
          status: 'available',
          endpoint: cap.apiEndpoint,
          description: cap.description
        })

      default:
        return NextResponse.json({ 
          error: 'Unknown action' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Capabilities POST error:', error)
    return NextResponse.json({
      error: 'Failed to process capability request'
    }, { status: 500 })
  }
}
