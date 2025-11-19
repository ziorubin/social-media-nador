import React, { useState } from 'react';
import { Send, Sparkles, AlertCircle, Copy, Check, Instagram, Linkedin, Facebook, Twitter, Video, Image as ImageIcon, Settings, PenTool, UploadCloud, Edit2, Globe } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import Loader from './components/Loader';
import SocialMockups from './components/SocialMockups';
import ConfigPanel from './components/ConfigPanel';
import { ImageFile, GenerationState, MarketingCampaign, BrandConfig, SocialPlatform, GeneratedPost } from './types';
import { analyzeImage, generateMarketingContent, generateSocialImage } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'settings'>('create');
  const [image, setImage] = useState<ImageFile | null>(null);
  const [instructions, setInstructions] = useState('');
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [result, setResult] = useState<MarketingCampaign | null>(null);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('Instagram');
  const [copied, setCopied] = useState(false);
  const [generatingImagesFor, setGeneratingImagesFor] = useState<Set<string>>(new Set());
  
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    companyBackground: '',
    targetAudience: '',
    toneOfVoice: '',
    contentRules: '',
    credentials: {
      Instagram: { isConnected: false, autoPublish: false, apiKey: '' },
      Facebook: { isConnected: false, autoPublish: false, apiKey: '' },
      Twitter: { isConnected: false, autoPublish: false, apiKey: '' },
      LinkedIn: { isConnected: false, autoPublish: false, apiKey: '' },
      TikTok: { isConnected: false, autoPublish: false, apiKey: '' },
    }
  });

  const handleGenerate = async () => {
    if (!image) {
      setGenerationState({ status: 'error', message: 'Please upload an image first.' });
      return;
    }
    if (!instructions.trim()) {
      setGenerationState({ status: 'error', message: 'Please add some instructions.' });
      return;
    }

    const enabledCount = Object.values(brandConfig.credentials).filter(c => c.isConnected).length;
    if (enabledCount === 0) {
        setGenerationState({ status: 'error', message: 'Please connect at least one social platform in Settings.' });
        setActiveTab('settings');
        return;
    }

    setResult(null);
    setGeneratingImagesFor(new Set());
    setGenerationState({ status: 'analyzing_image' });

    try {
      // Step 1: Analyze Image
      const analysis = await analyzeImage(image.base64, image.file.type);
      
      // Step 2: Think & Generate Text
      setGenerationState({ status: 'thinking' });
      const campaign = await generateMarketingContent(analysis, instructions, brandConfig);
      
      setResult(campaign);
      
      // Set active platform to the first available generated post
      if (campaign.posts.length > 0) {
        setActivePlatform(campaign.posts[0].platform);
      }

      setGenerationState({ status: 'completed' });

      // Step 3: Trigger Image Generation for all platforms in background
      generateImagesForCampaign(campaign);

    } catch (error: any) {
      setGenerationState({ 
        status: 'error', 
        message: error.message || 'Something went wrong. Please try again.' 
      });
    }
  };

  const generateImagesForCampaign = async (campaign: MarketingCampaign) => {
    const platforms = campaign.posts.map(p => p.platform);
    setGeneratingImagesFor(new Set(platforms));

    campaign.posts.forEach(async (post) => {
      try {
        const aspectRatio = getAspectRatioForPlatform(post.platform);
        const imageUrl = await generateSocialImage(post.imagePrompt, aspectRatio);
        
        if (imageUrl) {
          setResult(prev => {
            if (!prev) return null;
            return {
              ...prev,
              posts: prev.posts.map(p => 
                p.platform === post.platform ? { ...p, generatedImageUrl: imageUrl } : p
              )
            };
          });
        }
      } catch (err) {
        console.error(`Failed to generate image for ${post.platform}`, err);
      } finally {
        setGeneratingImagesFor(prev => {
          const next = new Set(prev);
          next.delete(post.platform);
          return next;
        });
      }
    });
  };

  const handlePublish = async (platform: SocialPlatform) => {
    setResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        posts: prev.posts.map(p => p.platform === platform ? { ...p, status: 'publishing' } : p)
      };
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        posts: prev.posts.map(p => p.platform === platform ? { ...p, status: 'published' } : p)
      };
    });
  };

  const handlePublishAll = async () => {
    if (!result) return;
    
    const drafts = result.posts.filter(p => p.status === 'draft');
    if (drafts.length === 0) return;

    // Set all drafts to publishing
    setResult(prev => ({
      ...prev!,
      posts: prev!.posts.map(p => p.status === 'draft' ? { ...p, status: 'publishing' } : p)
    }));

    // Process sequentially (simulated)
    for (const post of drafts) {
       await new Promise(resolve => setTimeout(resolve, 1500));
       setResult(prev => ({
        ...prev!,
        posts: prev!.posts.map(p => p.platform === post.platform ? { ...p, status: 'published' } : p)
       }));
    }
  };

  const handleUpdateContent = (platform: SocialPlatform, newContent: string) => {
    setResult(prev => {
        if (!prev) return null;
        return {
            ...prev,
            posts: prev.posts.map(p => p.platform === platform ? { ...p, content: newContent } : p)
        };
    });
  };

  const handleUpdateHashtags = (platform: SocialPlatform, newHashtagsString: string) => {
      // Basic splitting by space or newline
      const tags = newHashtagsString.split(/[\s\n]+/).filter(t => t.startsWith('#'));
      setResult(prev => {
        if (!prev) return null;
        return {
            ...prev,
            posts: prev.posts.map(p => p.platform === platform ? { ...p, hashtags: tags } : p)
        };
    });
  };

  const getAspectRatioForPlatform = (platform: string): string => {
    switch (platform) {
      case 'Instagram': return '1:1';
      case 'Facebook': return '4:3';
      case 'TikTok': return '9:16';
      case 'Twitter': return '16:9';
      case 'LinkedIn': return '16:9';
      default: return '1:1';
    }
  };

  const copyToClipboard = () => {
    const currentPost = result?.posts.find(p => p.platform === activePlatform);
    if (currentPost) {
      const textToCopy = `${currentPost.content}\n\n${currentPost.hashtags.join(' ')}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const PlatformIcon = ({ platform, active }: { platform: string; active: boolean }) => {
    const className = `w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`;
    switch (platform) {
      case 'Instagram': return <Instagram className={className} />;
      case 'LinkedIn': return <Linkedin className={className} />;
      case 'Facebook': return <Facebook className={className} />;
      case 'Twitter': return <Twitter className={className} />;
      case 'TikTok': return <Video className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const getStatusColor = (status: GeneratedPost['status']) => {
    switch(status) {
        case 'published': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'publishing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse';
        case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
        default: return 'text-slate-400 bg-slate-700/50 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-inter">
      <Loader state={generationState} />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SocialSync AI Agency
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             {result && (
                <button 
                    onClick={handlePublishAll}
                    disabled={!result.posts.some(p => p.status === 'draft')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        !result.posts.some(p => p.status === 'draft')
                        ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                    }`}
                >
                    <UploadCloud size={16} />
                    <span>
                        {!result.posts.some(p => p.status === 'draft') ? 'All Published' : 'Publish All'}
                    </span>
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration & Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-140px)] flex flex-col sticky top-24">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-800 shrink-0">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                    activeTab === 'create' 
                    ? 'bg-slate-800 text-white border-b-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <PenTool size={16} />
                  <span>Create Campaign</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                    activeTab === 'settings' 
                    ? 'bg-slate-800 text-white border-b-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Settings size={16} />
                  <span>Brand Settings</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {activeTab === 'create' ? (
                  <div className="space-y-6 animate-fadeIn">
                    <ImageUpload 
                      selectedImage={image} 
                      onImageSelect={setImage} 
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Campaign Instructions
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="E.g., Create a summer launch campaign for this new organic iced coffee. Target audience is Gen Z. Tone should be energetic. (Puoi scrivere anche in italiano)"
                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {generationState.status === 'error' && (
                      <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                        <AlertCircle size={16} />
                        <span>{generationState.message}</span>
                      </div>
                    )}

                    <button
                      onClick={handleGenerate}
                      disabled={!image || !instructions || (generationState.status !== 'idle' && generationState.status !== 'completed' && generationState.status !== 'error')}
                      className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 ${
                        !image || !instructions
                          ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500'
                      }`}
                    >
                      <Send size={20} />
                      <span>Generate Strategy & Assets</span>
                    </button>
                    
                     {/* Context Status */}
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-xs text-slate-500 uppercase font-semibold">Connected Platforms</p>
                             <span className="text-xs text-slate-400">{Object.values(brandConfig.credentials).filter(c => c.isConnected).length} Active</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(brandConfig.credentials).map(([platform, creds]) => (
                                <div key={platform} className={`w-2 h-2 rounded-full ${creds.isConnected ? 'bg-emerald-500' : 'bg-slate-700'}`} title={platform} />
                            ))}
                        </div>
                    </div>
                  </div>
                ) : (
                  <ConfigPanel config={brandConfig} setConfig={setBrandConfig} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Output Section */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl min-h-[calc(100vh-140px)] flex flex-col overflow-hidden sticky top-24">
              {result ? (
                <>
                  <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                    <h2 className="text-lg font-semibold text-white mb-2">Strategic Insight</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.strategicInsight}</p>
                  </div>

                  <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
                    {result.posts.map((post) => (
                      <button
                        key={post.platform}
                        onClick={() => setActivePlatform(post.platform)}
                        className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                          activePlatform === post.platform
                            ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                      >
                        <PlatformIcon platform={post.platform} active={activePlatform === post.platform} />
                        <span>{post.platform}</span>
                        <span className={`w-2 h-2 rounded-full ml-1 ${post.status === 'published' ? 'bg-emerald-500' : post.status === 'publishing' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></span>
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 p-6 bg-slate-900/50 overflow-y-auto">
                     {result.posts.map((post) => {
                       if (post.platform !== activePlatform) return null;
                       return (
                         <div key={post.platform} className="animate-fadeIn">
                           <div className="flex items-center justify-between mb-6">
                               <div className={`px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center space-x-2 ${getStatusColor(post.status)}`}>
                                   {post.status === 'publishing' && <div className="w-2 h-2 bg-current rounded-full animate-ping" />}
                                   <span>{post.status}</span>
                               </div>

                              <div className="flex space-x-2">
                                  <button
                                    onClick={copyToClipboard}
                                    className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-slate-700/50"
                                  >
                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    <span>Copy</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => handlePublish(post.platform)}
                                    disabled={post.status !== 'draft'}
                                    className={`flex items-center space-x-2 text-xs font-medium px-4 py-1.5 rounded-lg border transition-colors ${
                                        post.status === 'published' 
                                        ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10'
                                        : 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                                    }`}
                                  >
                                    <UploadCloud size={14} />
                                    <span>{post.status === 'published' ? 'Published' : 'Publish Now'}</span>
                                  </button>
                              </div>
                           </div>
                           
                           <div className="flex flex-col xl:flex-row gap-8">
                             {/* Visual Preview */}
                             <div className="flex-1 flex justify-center">
                                {image && (
                                  <SocialMockups 
                                    post={post} 
                                    imagePreviewUrl={image.previewUrl} 
                                    isGeneratingImage={generatingImagesFor.has(post.platform)}
                                  />
                                )}
                             </div>
                             
                             {/* Text Content (Editable) */}
                             <div className="flex-1 xl:max-w-sm space-y-4">
                               <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                 <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Caption</h4>
                                    <Edit2 size={12} className="text-slate-500" />
                                 </div>
                                 <textarea 
                                    value={post.content}
                                    onChange={(e) => handleUpdateContent(post.platform, e.target.value)}
                                    className="w-full bg-slate-900/50 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-700/50 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[150px]"
                                 />
                               </div>

                               <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                 <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Hashtags</h4>
                                 <div className="flex flex-wrap gap-1">
                                   {post.hashtags.map((tag, i) => (
                                     <span key={i} className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">
                                       {tag}
                                     </span>
                                   ))}
                                 </div>
                               </div>

                               <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">AI Visual Prompt</h4>
                                  <div className="flex items-start space-x-2">
                                    <ImageIcon size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-slate-400 italic">{post.imagePrompt}</p>
                                  </div>
                               </div>

                               {post.tips && (
                                 <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                                   <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pro Tip</h4>
                                   <p className="text-xs text-emerald-200/80">{post.tips}</p>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       );
                     })}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[500px]">
                   <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                      <Sparkles size={24} className="text-slate-600" />
                    </div>
                    <p className="text-center max-w-sm">
                      Configure your brand settings, upload visuals, and generate professional content in seconds.
                    </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;