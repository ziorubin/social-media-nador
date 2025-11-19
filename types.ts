export type SocialPlatform = 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'TikTok';

export type PublicationStatus = 'draft' | 'publishing' | 'published' | 'failed';

export interface SocialPost {
  platform: SocialPlatform;
  content: string;
}

export interface GeneratedPost {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  tips?: string;
  imagePrompt: string;
  generatedImageUrl?: string;
  status: PublicationStatus;
}

export interface MarketingCampaign {
  strategicInsight: string;
  posts: GeneratedPost[];
}

export interface GenerationState {
  status: 'idle' | 'analyzing_image' | 'thinking' | 'generating' | 'generating_images' | 'completed' | 'error';
  message?: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface PlatformCredential {
  isConnected: boolean;
  autoPublish: boolean;
  apiKey?: string; // Simulation of a token
  pageId?: string;
}

export interface BrandConfig {
  companyBackground: string;
  targetAudience: string;
  toneOfVoice: string;
  contentRules: string;
  credentials: Record<SocialPlatform, PlatformCredential>;
}