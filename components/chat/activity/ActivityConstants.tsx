import type React from "react"
import {
  Activity,
  AlertCircle,
  Bot,
  Brain,
  Calculator,
  Camera,
  CheckCircle,
  Clock,
  Database,
  Eye,
  FileText,
  GraduationCap,
  ImageIcon,
  Link,
  Mail,
  MessageSquare,
  Mic,
  Monitor,
  Search,
  Upload,
  Zap
} from "lucide-react"

// Unified activity item interface
export interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp?: Date | string
  progress?: number
}

// Stage interface for monitor variant
export interface ActivityStage {
  id: string
  label: string
  done?: boolean
  current?: boolean
}

// Icon mapping - consolidated from all components
export const ACTIVITY_ICONS: Partial<Record<string, React.ElementType>> = {
  user_action: MessageSquare,
  ai_thinking: Brain,
  ai_stream: Bot,
  ai_request: Bot,
  google_search: Search,
  search: Search,
  doc_analysis: FileText,
  file_upload: Upload,
  image_upload: ImageIcon,
  voice_input: Mic,
  voice_response: Mic,
  screen_share: Monitor,
  webcam_capture: Camera,
  roi_calculation: Calculator,
  workshop_access: GraduationCap,
  email_sent: Mail,
  error: AlertCircle,
  web_scrape: Link,
  link: Link,
  vision_analysis: Eye,
  database: Database,
  complete: CheckCircle,
  analyze: Brain,
  generate: Brain,
  processing: Brain,
  tool_used: Zap,
}

// Status styling configurations
export const STATUS_STYLES = {
  default: {
    in_progress: "w-3 h-3 bg-gradient-to-br from-accent to-accent/80 border border-accent/50 shadow-sm animate-pulse",
    completed: "w-2.5 h-2.5 bg-accent border border-accent/50 shadow-sm",
    failed: "w-2.5 h-2.5 bg-destructive border border-destructive/50 shadow-sm opacity-80",
    pending: "w-2 h-2 bg-muted-foreground/30 border border-muted-foreground/20 opacity-60",
  },
  minimal: {
    in_progress: "w-6 h-6 bg-surface border-2 border-muted-foreground/60 shadow-lg animate-pulse",
    completed: "w-4 h-4 bg-muted-foreground/40 border border-muted-foreground/30",
    failed: "w-4 h-4 bg-muted-foreground/30 border border-muted-foreground/20 opacity-40",
    pending: "w-3 h-3 bg-muted-foreground/30 border border-muted-foreground/20 opacity-40",
  },
  detailed: {
    in_progress: "w-4 h-4 bg-gradient-to-br from-accent to-accent/80 border border-accent/50 shadow-sm animate-pulse",
    completed: "w-3 h-3 bg-accent border border-accent/50 shadow-sm",
    failed: "w-3 h-3 bg-destructive border border-destructive/50 shadow-sm opacity-80",
    pending: "w-2.5 h-2.5 bg-muted-foreground/30 border border-muted-foreground/20 opacity-60",
  }
}

// Chip-specific status colors
export const CHIP_STATUS_COLORS = {
  in: {
    bg: "bg-[hsl(var(--chart-success))]/10",
    text: "text-[hsl(var(--chart-success))]",
    border: "border-[hsl(var(--chart-success))]/20"
  },
  out: {
    bg: "bg-[hsl(var(--destructive))]/10",
    text: "text-[hsl(var(--destructive))]",
    border: "border-[hsl(var(--destructive))]/20"
  }
}
