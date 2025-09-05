export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  sources?: Array<{ title: string; url: string }>;
  videoToAppCard?: any;
}
