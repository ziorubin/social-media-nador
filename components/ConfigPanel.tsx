import React, { useState } from 'react';
import { BrandConfig, SocialPlatform } from '../types';
import { Building2, FileText, Settings, Check, Instagram, Linkedin, Facebook, Twitter, Video, Users, Megaphone, Lock, Zap, Globe } from 'lucide-react';

interface ConfigPanelProps {
  config: BrandConfig;
  setConfig: React.Dispatch<React.SetStateAction<BrandConfig>>;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig }) => {
  const [activeSection, setActiveSection] = useState<'brand' | 'rules' | 'integrations'>('brand');
  
  const togglePlatform = (platform: SocialPlatform) => {
    setConfig(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [platform]: {
          ...prev.credentials[platform],
          isConnected: !prev.credentials[platform].isConnected
        }
      }
    }));
  };

  const toggleAutoPublish = (platform: SocialPlatform) => {
     setConfig(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [platform]: {
          ...prev.credentials[platform],
          autoPublish: !prev.credentials[platform].autoPublish
        }
      }
    }));
  };

  const handleKeyChange = (platform: SocialPlatform, value: string) => {
    setConfig(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [platform]: {
          ...prev.credentials[platform],
          apiKey: value
        }
      }
    }));
  };

  const handleChange = (field: keyof BrandConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const IntegrationRow = ({ platform, icon: Icon, label }: { platform: SocialPlatform; icon: any; label: string }) => {
    const creds = config.credentials[platform];
    const isConnected = creds.isConnected;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isConnected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-white">{label}</h4>
                    <p className="text-xs text-slate-500">{isConnected ? 'Connected' : 'Not connected'}</p>
                </div>
            </div>
            <button
                onClick={() => togglePlatform(platform)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
                {isConnected ? 'Connected' : 'Connect'}
            </button>
        </div>

        {isConnected && (
            <div className="pt-4 border-t border-slate-700/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center">
                        <Zap size={12} className="mr-1.5" />
                        Auto-Publish
                    </span>
                    <button 
                        onClick={() => toggleAutoPublish(platform)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${creds.autoPublish ? 'bg-indigo-500' : 'bg-slate-600'}`}
                    >
                         <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${creds.autoPublish ? 'left-4.5 translate-x-0.5' : 'left-0.5'}`} />
                    </button>
                </div>
                <div className="relative">
                     <input 
                        type="password" 
                        value={creds.apiKey || ''} 
                        onChange={(e) => handleKeyChange(platform, e.target.value)}
                        placeholder="Enter API Key / Token"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
                    />
                    <Lock size={12} className="absolute left-3 top-2.5 text-slate-600" />
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sub Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-800/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSection('brand')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSection === 'brand' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Identity
        </button>
        <button
          onClick={() => setActiveSection('rules')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSection === 'rules' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Content Rules
        </button>
         <button
          onClick={() => setActiveSection('integrations')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSection === 'integrations' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Integrations
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 animate-fadeIn">
        {activeSection === 'brand' && (
            <div className="space-y-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Building2 size={16} className="text-indigo-400" />
                        <label className="text-sm font-medium text-slate-300">Company Background</label>
                    </div>
                    <textarea
                        value={config.companyBackground}
                        onChange={(e) => handleChange('companyBackground', e.target.value)}
                        placeholder="Describe your company, mission, and unique selling propositions..."
                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Users size={16} className="text-blue-400" />
                            <label className="text-sm font-medium text-slate-300">Target Audience</label>
                        </div>
                         <input
                            type="text"
                            value={config.targetAudience}
                            onChange={(e) => handleChange('targetAudience', e.target.value)}
                            placeholder="e.g., Gen Z Gamers, Corporate Executives"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                     <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Megaphone size={16} className="text-purple-400" />
                            <label className="text-sm font-medium text-slate-300">Tone of Voice</label>
                        </div>
                         <input
                            type="text"
                            value={config.toneOfVoice}
                            onChange={(e) => handleChange('toneOfVoice', e.target.value)}
                            placeholder="e.g., Witty, Professional, Urgent, Relaxed"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        )}

        {activeSection === 'rules' && (
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <FileText size={16} className="text-emerald-400" />
                    <label className="text-sm font-medium text-slate-300">Generation Rules</label>
                </div>
                <textarea
                    value={config.contentRules}
                    onChange={(e) => handleChange('contentRules', e.target.value)}
                    placeholder="E.g. Use formal language, avoid emojis, always include link in bio..."
                    className="w-full h-64 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                />
                <p className="mt-3 text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <span className="font-semibold text-emerald-400">Tip:</span> These rules act as a strict filter for the AI. Use this to enforce forbidden words, sentence length limits, or specific formatting structures.
                </p>
            </div>
        )}

        {activeSection === 'integrations' && (
            <div className="space-y-4">
                <p className="text-xs text-slate-400 mb-2">Connect your social accounts to enable one-click publishing.</p>
                <div className="grid grid-cols-1 gap-3">
                    <IntegrationRow platform="Instagram" icon={Instagram} label="Instagram Business" />
                    <IntegrationRow platform="Facebook" icon={Facebook} label="Facebook Page" />
                    <IntegrationRow platform="Twitter" icon={Twitter} label="X (Twitter)" />
                    <IntegrationRow platform="LinkedIn" icon={Linkedin} label="LinkedIn Company" />
                    <IntegrationRow platform="TikTok" icon={Video} label="TikTok Business" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;