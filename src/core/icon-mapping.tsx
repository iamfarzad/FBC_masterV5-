// Temporary neutral icon shims to unblock TypeScript when the icon package
// name/exports don't match. Replace these with your chosen icon library later.
import * as React from 'react'

type IconProps = React.SVGProps<SVGSVGElement>;
const Stub = (props: IconProps) => (
  <svg role="img" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const PhosphorCopy = Stub;
export const PhosphorCheck = Stub;
export const PhosphorDownload = Stub;
export const PhosphorPlay = Stub;
export const PhosphorPause = Stub;
export const PhosphorSquare = Stub;
export const PhosphorRotateCcw = Stub;
export const PhosphorFileText = Stub;
export const PhosphorImage = Stub;
export const PhosphorVideo = Stub;
export const PhosphorMic = Stub;
export const PhosphorMicOff = Stub;
export const PhosphorCalculator = Stub;
export const PhosphorMonitor = Stub;
export const PhosphorSparkles = Stub;
export const PhosphorZap = Stub;
export const PhosphorBot = Stub;
export const PhosphorTrendingUp = Stub;
export const PhosphorFileSearch = Stub;
export const PhosphorBrain = Stub;
export const PhosphorLoader2 = Stub;
export const PhosphorUser = Stub;
export const PhosphorAlertTriangle = Stub;
export const PhosphorInfo = Stub;
export const PhosphorClock = Stub;
export const PhosphorTarget = Stub;
export const PhosphorEdit = Stub;
export const PhosphorSend = Stub;
export const PhosphorCamera = Stub;
export const PhosphorPaperclip = Stub;
export const PhosphorPlus = Stub;
export const PhosphorX = Stub;
export const PhosphorChevronDown = Stub;
export const PhosphorArrowRight = Stub;
export const PhosphorArrowLeft = Stub;
export const PhosphorMaximize2 = Stub;
export const PhosphorMinimize2 = Stub;
export const PhosphorUpload = Stub;
export const PhosphorEye = Stub;
export const PhosphorEyeOff = Stub;
export const PhosphorVideoOff = Stub;
export const PhosphorLink = Stub;
export const PhosphorLanguages = Stub;
export const PhosphorMenu = Stub;
export const PhosphorBarChart = Stub;
export const PhosphorStar = Stub;
export const PhosphorLoader = Stub;
export const PhosphorWrench = Stub;
export const PhosphorHome = Stub;
export const PhosphorUsers = Stub;
export const PhosphorCalendar = Stub;
export const PhosphorDollarSign = Stub;
export const PhosphorCheckCircle = Stub;
export const PhosphorXCircle = Stub;
export const PhosphorArrowDown = Stub;
export const PhosphorExternalLink = Stub;
export const PhosphorMessageSquare = Stub;

// Add missing exports that components are trying to import
export const Plus = Stub;
export const FileText = Stub;
export const ImageIcon = Stub;
export const Camera = Stub;
export const Monitor = Stub;
export const Calculator = Stub;
export const Video = Stub;
export const Check = Stub;
export const ArrowLeft = Stub;
export const Menu = Stub;
export const Languages = Stub;
export const ChevronDown = Stub;
export const Globe = Stub;
export const X = Stub;

// TODO: Replace stub icons with actual icon library
