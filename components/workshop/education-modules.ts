export interface WorkshopModule {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  category: string
  steps: ModuleStep[]
}

export interface ModuleStep {
  id: string
  title: string
  content: string
  type: 'lesson' | 'exercise' | 'quiz'
  component?: string
}

export const educationModules: WorkshopModule[] = [
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'Understanding the basics of artificial intelligence',
    difficulty: 'beginner',
    duration: '30 min',
    category: 'Core Concepts',
    steps: [
      {
        id: 'intro',
        title: 'Introduction to AI',
        content: 'Learn what AI is and how it works',
        type: 'lesson',
        component: 'ai-hierarchy-visual'
      },
      {
        id: 'tokenization',
        title: 'How AI Understands Text',
        content: 'Explore tokenization and text processing',
        type: 'exercise',
        component: 'tokenization-visualizer'
      },
      {
        id: 'models',
        title: 'Understanding AI Models',
        content: 'Learn about different AI model architectures',
        type: 'lesson',
        component: 'llm-parameter-growth'
      }
    ]
  },
  {
    id: 'advanced-concepts',
    title: 'Advanced AI Concepts',
    description: 'Deep dive into neural networks and transformers',
    difficulty: 'advanced',
    duration: '45 min',
    category: 'Technical Deep Dive',
    steps: [
      {
        id: 'attention',
        title: 'Attention Mechanisms',
        content: 'Understand how attention works in transformers',
        type: 'exercise',
        component: 'attention-mechanism-demo'
      },
      {
        id: 'embeddings',
        title: 'Word Embeddings',
        content: 'Explore how AI represents meaning',
        type: 'exercise',
        component: 'embedding-explorer'
      },
      {
        id: 'sampling',
        title: 'Temperature and Sampling',
        content: 'Control AI output creativity',
        type: 'exercise',
        component: 'temperature-sampling-controls'
      }
    ]
  },
  {
    id: 'practical-applications',
    title: 'Practical AI Applications',
    description: 'Apply AI to real-world problems',
    difficulty: 'intermediate',
    duration: '40 min',
    category: 'Hands-On',
    steps: [
      {
        id: 'prompt-engineering',
        title: 'Prompt Engineering',
        content: 'Master the art of prompting AI',
        type: 'exercise',
        component: 'prompt-engineering-sandbox'
      },
      {
        id: 'hallucination',
        title: 'Detecting Hallucinations',
        content: 'Identify and prevent AI hallucinations',
        type: 'exercise',
        component: 'hallucination-checker'
      },
      {
        id: 'bias',
        title: 'Understanding AI Bias',
        content: 'Explore and mitigate AI biases',
        type: 'exercise',
        component: 'bias-explorer'
      },
      {
        id: 'reasoning',
        title: 'AI Reasoning',
        content: 'Visualize how AI thinks',
        type: 'exercise',
        component: 'reasoning-visualizer'
      }
    ]
  },
  {
    id: 'business-tools',
    title: 'Business AI Tools',
    description: 'AI tools for business applications',
    difficulty: 'beginner',
    duration: '25 min',
    category: 'Business',
    steps: [
      {
        id: 'roi',
        title: 'ROI Calculator',
        content: 'Calculate AI implementation ROI',
        type: 'exercise',
        component: 'roi-calculator'
      },
      {
        id: 'automation',
        title: 'Process Automation',
        content: 'Identify automation opportunities',
        type: 'lesson',
        component: 'automation-finder'
      }
    ]
  }
]

export function getModuleById(id: string): WorkshopModule | undefined {
  return educationModules.find(m => m.id === id)
}

export function getModulesByCategory(category: string): WorkshopModule[] {
  return educationModules.filter(m => m.category === category)
}

export function getModulesByDifficulty(difficulty: WorkshopModule['difficulty']): WorkshopModule[] {
  return educationModules.filter(m => m.difficulty === difficulty)
}