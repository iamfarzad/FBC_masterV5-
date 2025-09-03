export interface Capability {
  id: string
  name: string
  description: string
  category: 'analysis' | 'generation' | 'transformation' | 'utility'
  enabled: boolean
  requiredPermissions?: string[]
}

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map()

  constructor() {
    this.registerDefaultCapabilities()
  }

  private registerDefaultCapabilities() {
    const defaultCapabilities: Capability[] = [
      {
        id: 'chat',
        name: 'Chat Conversation',
        description: 'Engage in natural language conversation',
        category: 'utility',
        enabled: true
      },
      {
        id: 'code_generation',
        name: 'Code Generation',
        description: 'Generate code in various programming languages',
        category: 'generation',
        enabled: true
      },
      {
        id: 'translation',
        name: 'Language Translation',
        description: 'Translate text between languages',
        category: 'transformation',
        enabled: true
      },
      {
        id: 'summarization',
        name: 'Text Summarization',
        description: 'Summarize long texts into concise versions',
        category: 'transformation',
        enabled: true
      },
      {
        id: 'image_analysis',
        name: 'Image Analysis',
        description: 'Analyze and describe images',
        category: 'analysis',
        enabled: true
      },
      {
        id: 'roi_calculation',
        name: 'ROI Calculator',
        description: 'Calculate return on investment',
        category: 'utility',
        enabled: true
      },
      {
        id: 'web_search',
        name: 'Web Search',
        description: 'Search the web for information',
        category: 'utility',
        enabled: true
      },
      {
        id: 'screen_analysis',
        name: 'Screen Analysis',
        description: 'Analyze screen captures',
        category: 'analysis',
        enabled: true
      },
      {
        id: 'voice_transcription',
        name: 'Voice Transcription',
        description: 'Convert speech to text',
        category: 'transformation',
        enabled: true
      },
      {
        id: 'document_processing',
        name: 'Document Processing',
        description: 'Process and analyze documents',
        category: 'analysis',
        enabled: true
      }
    ]

    defaultCapabilities.forEach(cap => {
      this.capabilities.set(cap.id, cap)
    })
  }

  getCapability(id: string): Capability | undefined {
    return this.capabilities.get(id)
  }

  getAllCapabilities(): Capability[] {
    return Array.from(this.capabilities.values())
  }

  getEnabledCapabilities(): Capability[] {
    return this.getAllCapabilities().filter(cap => cap.enabled)
  }

  getCapabilitiesByCategory(category: Capability['category']): Capability[] {
    return this.getAllCapabilities().filter(cap => cap.category === category)
  }

  enableCapability(id: string): boolean {
    const capability = this.capabilities.get(id)
    if (capability) {
      capability.enabled = true
      return true
    }
    return false
  }

  disableCapability(id: string): boolean {
    const capability = this.capabilities.get(id)
    if (capability) {
      capability.enabled = false
      return true
    }
    return false
  }
}

export const capabilityRegistry = new CapabilityRegistry()