// Unified Icon Mapping - Consolidates Lucide and Phosphor icons
// This file provides a single source for all icons used in the codebase
// Priority: Phosphor icons for better performance, fallback to Lucide for missing icons

import {
  // Chat Area Icons
  Copy as PhosphorCopy,
  Check as PhosphorCheck,
  Download as PhosphorDownload,
  Play as PhosphorPlay,
  Pause as PhosphorPause,
  Square as PhosphorSquare,
  ArrowCounterClockwise as PhosphorRotateCcw,
  FileText as PhosphorFileText,
  Image as PhosphorImage,
  VideoCamera as PhosphorVideo,
  Microphone as PhosphorMic,
  MicrophoneSlash as PhosphorMicOff,
  Calculator as PhosphorCalculator,
  Monitor as PhosphorMonitor,
  Sparkle as PhosphorSparkles,
  Lightning as PhosphorZap,
  ChatCircle as PhosphorBot, // Better AI icon - using ChatCircle instead of Robot
  TrendUp as PhosphorTrendingUp,
  MagnifyingGlass as PhosphorFileSearch, // Using MagnifyingGlass for FileSearch
  Brain as PhosphorBrain,
  CircleNotch as PhosphorLoader2,
  User as PhosphorUser,
  Warning as PhosphorAlertTriangle, // Using Warning for AlertTriangle
  Info as PhosphorInfo,
  Clock as PhosphorClock,
  Target as PhosphorTarget,
  PencilSimple as PhosphorEdit,

  // Chat Footer Icons
  PaperPlaneTilt as PhosphorSend,
  Camera as PhosphorCamera,
  Paperclip as PhosphorPaperclip,
  Plus as PhosphorPlus,
  X as PhosphorX,
  CaretDown as PhosphorChevronDown,

  // Additional Tool Icons
  ArrowRight as PhosphorArrowRight,
  ArrowLeft as PhosphorArrowLeft,
  ArrowsOut as PhosphorMaximize2,
  ArrowsIn as PhosphorMinimize2,
  Upload as PhosphorUpload,
  Eye as PhosphorEye,
  EyeSlash as PhosphorEyeOff,
  VideoCameraSlash as PhosphorVideoOff,
  Link as PhosphorLink,
  Translate as PhosphorLanguages,
  List as PhosphorMenu,

  // Additional icons from Lucide approach
  ChartBar as PhosphorBarChart, // BarChart3 doesn't exist, use ChartBar
  Star as PhosphorStar,
  CircleNotch as PhosphorLoader, // Alias for Loader
  Wrench as PhosphorWrench,
  // Activity doesn't exist in Phosphor, will use Lucide fallback
  House as PhosphorHome,
  Users as PhosphorUsers,
  Calendar as PhosphorCalendar,
  CurrencyDollar as PhosphorDollarSign,
  CheckCircle as PhosphorCheckCircle,
  XCircle as PhosphorXCircle,
  ArrowCircleDown as PhosphorArrowDown,
  ShareNetwork as PhosphorExternalLink,
  ChatCircle as PhosphorMessageSquare
} from '@phosphor-icons/react'

// Fallback Lucide icons for icons not available in Phosphor
import {
  Search,
  Mail,
  Globe,
  Database,
  Activity // Activity not available in Phosphor, use Lucide
} from 'lucide-react'

// Export mapped icons with their original Lucide names for easy replacement
export {
  // Chat Area Icons
  PhosphorCopy as Copy,
  PhosphorCheck as Check,
  PhosphorDownload as Download,
  PhosphorPlay as Play,
  PhosphorPause as Pause,
  PhosphorSquare as Square,
  PhosphorRotateCcw as RotateCcw,
  PhosphorFileText as FileText,
  PhosphorImage as ImageIcon, // Note: Lucide uses "Image as ImageIcon"
  PhosphorVideo as Video,
  PhosphorMic as Mic,
  PhosphorMicOff as MicOff,
  PhosphorCalculator as Calculator,
  PhosphorMonitor as Monitor,
  PhosphorSparkles as Sparkles,
  PhosphorZap as Zap,
  PhosphorBot as Bot,
  PhosphorTrendingUp as TrendingUp,
  PhosphorFileSearch as FileSearch,
  PhosphorBrain as Brain,
  PhosphorLoader2 as Loader2,
  PhosphorUser as User,
  PhosphorAlertTriangle as AlertTriangle,
  PhosphorInfo as Info,
  PhosphorClock as Clock,
  PhosphorTarget as Target,
  PhosphorEdit as Edit,

  // Chat Footer Icons
  PhosphorSend as Send,
  PhosphorCamera as Camera,
  PhosphorPaperclip as Paperclip,
  PhosphorPlus as Plus,
  PhosphorX as X,
  PhosphorChevronDown as ChevronDown,

  // Additional Tool Icons
  PhosphorArrowRight as ArrowRight,
  PhosphorArrowLeft as ArrowLeft,
  PhosphorMaximize2 as Maximize2,
  PhosphorMinimize2 as Minimize2,
  PhosphorUpload as Upload,
  PhosphorEye as Eye,
  PhosphorEyeOff as EyeOff,
  PhosphorVideoOff as VideoOff,
  PhosphorLink as Link,
  PhosphorLanguages as Languages,
  PhosphorMenu as Menu,
  PhosphorArrowDown as ArrowDown,

  // Additional icons from Lucide approach
  PhosphorBarChart as BarChart3,
  PhosphorStar as Star,
  PhosphorLoader as Loader,
  PhosphorWrench as Wrench,
  // PhosphorActivity as Activity, // Not available, using Lucide fallback
  PhosphorHome as Home,
  PhosphorUsers as Users,
  PhosphorCalendar as Calendar,
  PhosphorDollarSign as DollarSign,
  PhosphorCheckCircle as CheckCircle,
  PhosphorXCircle as XCircle,
  PhosphorExternalLink as ExternalLink,
  PhosphorMessageSquare as MessageSquare,

  // Fallback Lucide icons
  Search,
  Mail,
  Globe,
  Database,
  Activity // Using Lucide Activity since not available in Phosphor
}

// Icon mapping object for programmatic access
export const iconMapping = {
  // Lucide -> Phosphor mapping
  Copy: 'Copy',
  Check: 'Check',
  Download: 'Download',
  Play: 'Play',
  Pause: 'Pause',
  Square: 'Square',
  RotateCcw: 'ArrowCounterClockwise',
  FileText: 'FileText',
  ImageIcon: 'Image',
  Video: 'VideoCamera',
  Mic: 'Microphone',
  Calculator: 'Calculator',
  Monitor: 'Monitor',
  Sparkles: 'Sparkle',
  Zap: 'Lightning',
  Bot: 'ChatCircle',
  TrendingUp: 'TrendUp',
  FileSearch: 'MagnifyingGlass',
  Brain: 'Brain',
  Loader2: 'CircleNotch',
  User: 'User',
  AlertTriangle: 'Warning',
  Info: 'Info',
  Clock: 'Clock',
  Target: 'Target',
  Edit: 'PencilSimple',
  Send: 'PaperPlaneTilt',
  Camera: 'Camera',
  Paperclip: 'Paperclip',
  Plus: 'Plus',
  X: 'X',
  ChevronDown: 'CaretDown',

  // Additional mappings for new icons
  BarChart3: 'BarChart3',
  Star: 'Star',
  Loader: 'CircleNotch',
  Wrench: 'Wrench',
  Activity: 'Activity',
  Home: 'House',
  Users: 'Users',
  Calendar: 'Calendar',
  DollarSign: 'CurrencyDollar',
  CheckCircle: 'CheckCircle',
  XCircle: 'XCircle',
  ExternalLink: 'ShareNetwork',
  MessageSquare: 'ChatCircle',
  Search: 'Search', // Fallback Lucide
  Mail: 'Mail', // Fallback Lucide
  Globe: 'Globe', // Fallback Lucide
  Database: 'Database' // Fallback Lucide
}
