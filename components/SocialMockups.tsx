import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Repeat, Send, ThumbsUp, Globe, Music2, Plus, Loader2 } from 'lucide-react';
import { GeneratedPost } from '../types';

interface SocialMockupProps {
  post: GeneratedPost;
  imagePreviewUrl: string;
  isGeneratingImage?: boolean;
}

const ImageContainer: React.FC<{ src: string; alt: string; className?: string; isGenerating?: boolean }> = ({ src, alt, className, isGenerating }) => (
  <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
    <img src={src} alt={alt} className={`w-full h-full object-cover transition-opacity duration-500 ${isGenerating ? 'opacity-50' : 'opacity-100'}`} />
    {isGenerating && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
        <div className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center space-x-2 text-xs font-medium">
          <Loader2 size={14} className="animate-spin" />
          <span>Generating AI Visual...</span>
        </div>
      </div>
    )}
  </div>
);

const InstagramMockup: React.FC<{ post: GeneratedPost; image: string; isGenerating?: boolean }> = ({ post, image, isGenerating }) => (
  <div className="bg-white text-black rounded-xl overflow-hidden border border-gray-200 shadow-sm font-sans max-w-md mx-auto">
    <div className="p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full p-[2px]">
          <div className="w-full h-full bg-white rounded-full border border-white overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SocialSync" alt="User" />
          </div>
        </div>
        <span className="font-semibold text-sm">socialsync_agency</span>
      </div>
      <MoreHorizontal size={20} />
    </div>
    <ImageContainer src={image} alt="Post" className="aspect-square w-full" isGenerating={isGenerating} />
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <Heart size={24} className="hover:text-red-500 cursor-pointer transition-colors" />
          <MessageCircle size={24} className="hover:text-gray-600 cursor-pointer" />
          <Send size={24} className="hover:text-gray-600 cursor-pointer" />
        </div>
        <Bookmark size={24} className="hover:text-gray-600 cursor-pointer" />
      </div>
      <div className="text-sm">
        <p className="mb-2"><span className="font-semibold mr-2">socialsync_agency</span>{post.content}</p>
        <p className="text-blue-900 text-sm">{post.hashtags.join(' ')}</p>
      </div>
    </div>
  </div>
);

const TwitterMockup: React.FC<{ post: GeneratedPost; image: string; isGenerating?: boolean }> = ({ post, image, isGenerating }) => (
  <div className="bg-black text-white rounded-xl overflow-hidden border border-gray-800 shadow-sm font-sans max-w-md mx-auto p-4">
    <div className="flex space-x-3">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SocialSync" alt="User" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 mb-1">
          <span className="font-bold text-sm">SocialSync AI</span>
          <span className="text-gray-500 text-sm">@socialsync · 1h</span>
        </div>
        <p className="text-[15px] leading-normal whitespace-pre-wrap mb-3">{post.content}</p>
        <p className="text-blue-400 text-sm mb-3">{post.hashtags.join(' ')}</p>
        <div className="rounded-2xl overflow-hidden border border-gray-800 mb-3">
           <ImageContainer src={image} alt="Post" className="w-full h-auto aspect-video" isGenerating={isGenerating} />
        </div>
        <div className="flex justify-between text-gray-500 max-w-xs">
          <MessageCircle size={18} />
          <Repeat size={18} />
          <Heart size={18} />
          <Share2 size={18} />
        </div>
      </div>
    </div>
  </div>
);

const LinkedInMockup: React.FC<{ post: GeneratedPost; image: string; isGenerating?: boolean }> = ({ post, image, isGenerating }) => (
  <div className="bg-white text-gray-900 rounded-xl overflow-hidden border border-gray-300 shadow-sm font-sans max-w-md mx-auto">
    <div className="p-3 flex space-x-3 mb-2">
       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SocialSync" alt="User" />
       </div>
       <div>
         <div className="font-semibold text-sm">SocialSync AI Agency</div>
         <div className="text-xs text-gray-500">Marketing & Advertising • 1h • <Globe size={10} className="inline" /></div>
       </div>
    </div>
    <div className="px-3 pb-2 text-sm whitespace-pre-wrap">
      {post.content}
      <div className="mt-2 text-blue-600 font-medium">{post.hashtags.join(' ')}</div>
    </div>
    <ImageContainer src={image} alt="Post" className="w-full aspect-[1.91/1]" isGenerating={isGenerating} />
    <div className="px-4 py-2 flex justify-between border-t border-gray-100">
      <div className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer">
        <ThumbsUp size={18} />
        <span className="text-sm font-medium">Like</span>
      </div>
      <div className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer">
        <MessageCircle size={18} />
        <span className="text-sm font-medium">Comment</span>
      </div>
      <div className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer">
        <Repeat size={18} />
        <span className="text-sm font-medium">Repost</span>
      </div>
      <div className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer">
        <Send size={18} />
        <span className="text-sm font-medium">Send</span>
      </div>
    </div>
  </div>
);

const FacebookMockup: React.FC<{ post: GeneratedPost; image: string; isGenerating?: boolean }> = ({ post, image, isGenerating }) => (
  <div className="bg-white text-gray-900 rounded-xl overflow-hidden border border-gray-300 shadow-sm font-sans max-w-md mx-auto">
    <div className="p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SocialSync" alt="User" />
        </div>
        <div>
          <div className="font-semibold text-sm">SocialSync Brand</div>
          <div className="text-xs text-gray-500 flex items-center">Just now · <Globe size={10} className="ml-1" /></div>
        </div>
      </div>
      <MoreHorizontal size={20} className="text-gray-500" />
    </div>
    <div className="px-3 pb-3 text-[15px] whitespace-pre-wrap">
      {post.content}
      <div className="mt-1 text-blue-600">{post.hashtags.join(' ')}</div>
    </div>
    <ImageContainer src={image} alt="Post" className="w-full h-auto aspect-[4/3]" isGenerating={isGenerating} />
    <div className="px-3 py-2 border-t border-b border-gray-200 flex justify-between items-center">
       <div className="flex items-center -space-x-1">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10 border border-white">
            <ThumbsUp size={10} className="text-white" />
          </div>
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-white">
             <Heart size={10} className="text-white" />
          </div>
          <span className="ml-2 text-xs text-gray-500">You and 42 others</span>
       </div>
       <div className="text-xs text-gray-500">5 comments</div>
    </div>
    <div className="flex justify-between px-2 py-1">
      <div className="flex-1 flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600">
        <ThumbsUp size={18} />
        <span className="text-sm font-medium">Like</span>
      </div>
       <div className="flex-1 flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600">
        <MessageCircle size={18} />
        <span className="text-sm font-medium">Comment</span>
      </div>
       <div className="flex-1 flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600">
        <Share2 size={18} />
        <span className="text-sm font-medium">Share</span>
      </div>
    </div>
  </div>
);

const TikTokMockup: React.FC<{ post: GeneratedPost; image: string; isGenerating?: boolean }> = ({ post, image, isGenerating }) => (
  <div className="bg-black text-white rounded-xl overflow-hidden border border-gray-800 shadow-sm font-sans max-w-[300px] h-[530px] mx-auto relative">
    <img src={image} alt="Background" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isGenerating ? 'opacity-40' : 'opacity-80'}`} />
    {isGenerating && (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Loader2 size={24} className="animate-spin text-white" />
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
    
    {/* Right Actions */}
    <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4">
      <div className="w-10 h-10 rounded-full bg-white border-2 border-white overflow-hidden mb-2 relative">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SocialSync" alt="User" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 rounded-full p-[2px]">
          <Plus size={10} className="text-white" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Heart size={28} className="text-white fill-white" />
        <span className="text-xs font-semibold mt-1">1.2K</span>
      </div>
      <div className="flex flex-col items-center">
        <MessageCircle size={28} className="text-white fill-white opacity-90" />
        <span className="text-xs font-semibold mt-1">84</span>
      </div>
      <div className="flex flex-col items-center">
        <Bookmark size={28} className="text-white fill-white opacity-90" />
        <span className="text-xs font-semibold mt-1">203</span>
      </div>
      <div className="flex flex-col items-center">
        <Share2 size={28} className="text-white fill-white opacity-90" />
        <span className="text-xs font-semibold mt-1">Share</span>
      </div>
    </div>

    {/* Bottom Info */}
    <div className="absolute bottom-4 left-3 right-12">
      <div className="font-semibold mb-2 text-shadow">@socialsync_ai</div>
      <p className="text-sm mb-2 line-clamp-3 text-shadow leading-tight">
        {post.content} {post.hashtags.join(' ')}
      </p>
      <div className="flex items-center space-x-2 text-xs font-medium">
        <Music2 size={14} className="animate-pulse" />
        <div className="overflow-hidden w-32">
             <p className="whitespace-nowrap animate-marquee">Original Sound - Trending Audio 2025</p>
        </div>
      </div>
    </div>
  </div>
);

const SocialMockups: React.FC<SocialMockupProps> = ({ post, imagePreviewUrl, isGeneratingImage }) => {
  // Prioritize generated image, fall back to uploaded image
  const displayImage = post.generatedImageUrl || imagePreviewUrl;

  switch (post.platform) {
    case 'Instagram':
      return <InstagramMockup post={post} image={displayImage} isGenerating={isGeneratingImage} />;
    case 'Twitter':
      return <TwitterMockup post={post} image={displayImage} isGenerating={isGeneratingImage} />;
    case 'LinkedIn':
      return <LinkedInMockup post={post} image={displayImage} isGenerating={isGeneratingImage} />;
    case 'Facebook':
      return <FacebookMockup post={post} image={displayImage} isGenerating={isGeneratingImage} />;
    case 'TikTok':
      return <TikTokMockup post={post} image={displayImage} isGenerating={isGeneratingImage} />;
    default:
      return null;
  }
};

export default SocialMockups;