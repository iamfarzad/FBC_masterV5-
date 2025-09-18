import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const geminiApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY

const geminiProvider = createGoogleGenerativeAI(
  geminiApiKey ? { apiKey: geminiApiKey } : undefined,
)

const model = geminiProvider(
  process.env.GEMINI_TEXT_MODEL ||
    process.env.NEXT_PUBLIC_GEMINI_TEXT_MODEL ||
    'gemini-2.5-flash',
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  try {
    const { messages = [], context, mode = 'standard' } = await req.json()

    const prompt = messages[messages.length - 1]?.content || 'Hello!'

    const systemPrompt = mode === 'admin'
      ? 'You are F.B/c Admin Assistant. Provide concise, actionable business intelligence.'
      : 'You are F.B/c AI Assistant. Provide helpful, structured answers.'

    const result = await generateText({
      model,
      system: systemPrompt,
      prompt,
      temperature: 0.7,
    })

    const suggestions = buildSuggestions(prompt)
    const reasoning = buildReasoning(context, mode)

    return NextResponse.json({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.text,
      metadata: {
        mode,
        isComplete: true,
        suggestions,
        reasoning,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildSuggestions(prompt: string): string[] {
  const baseSuggestions = [
    'Can you expand on that?',
    'Show me the next steps.',
    'Summarise this for an executive.',
  ]

  if (!prompt) return baseSuggestions.slice(0, 2)

  const lowerPrompt = prompt.toLowerCase()
  if (lowerPrompt.includes('roi')) {
    return [
      'What assumptions went into the ROI figure?',
      'Can we model best and worst case scenarios?',
      'Draft a follow-up email to share these results.',
    ]
  }

  if (lowerPrompt.includes('lead') || lowerPrompt.includes('prospect')) {
    return [
      'Which lead stage should we prioritise next?',
      'Draft an outreach email for this lead.',
      'Suggest supporting materials I can share.',
    ]
  }

  return baseSuggestions
}

function buildReasoning(context: unknown, mode: string): string | undefined {
  if (!context || typeof context !== 'object') return undefined
  try {
    const ctx = context as { intelligenceContext?: any }
    const stageLabel = ctx.intelligenceContext?.stage || ctx.intelligenceContext?.currentStage
    if (stageLabel) {
      return `Response tailored for stage ${stageLabel} in ${mode} mode.`
    }
  } catch {
    // ignore invalid context shapes
  }
  return mode === 'admin'
    ? 'Provided an executive-level summary using available intelligence metadata.'
    : 'Synthesised a customer-facing answer using the active session context.'
}
