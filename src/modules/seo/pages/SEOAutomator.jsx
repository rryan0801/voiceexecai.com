import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { seoApi } from '@/modules/seo/api/seoApi';
import { base44 } from '@/api/base44Client';
import { Plus, Globe, Search, BarChart3, Target, TrendingUp, Zap, Award, FileText, Users, Mic, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { seo } from '@/modules/seo';
import VoiceCommand from '@/components/seo/VoiceCommand';
import SuccessMetrics from '@/components/SuccessMetrics';

export default function SEOAutomator() {
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showVoiceCommand, setShowVoiceCommand] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowAddForm(true);
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowVoiceCommand(true);
      }
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setShowVoiceCommand(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: websites, isLoading, refetch } = useQuery({
    queryKey: ['seo', 'websites'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await seoApi.getWebsites(user.id);
    }
  });

  const handleAudit = async (websiteId) => {
    try {
      await seoApi.runAudit(websiteId);
      refetch();
    } catch (error) {
      console.error('Audit error:', error);
    }
  };

  if (selectedWebsite) {
    return <seo.SEODashboard website={selectedWebsite} onBack={() => setSelectedWebsite(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {showVoiceCommand && <VoiceCommand onClose={() => setShowVoiceCommand(false)} onAction={(action, params) => {
        if (action === 'add_website') setShowAddForm(true);
        if (action === 'audit' && selectedWebsite) handleAudit(selectedWebsite.id);
        if (action === 'research') { /* trigger keyword research */ }
        setShowVoiceCommand(false);
      }} />}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SEO Automator</h1>
              <p className="text-slate-500">Fully automated SEO optimization — more visitors, zero manual work</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            <Keyboard className="w-3 h-3" />
            <span>⌘/Ctrl + N: Add website</span>
            <span className="mx-1">•</span>
            <Mic className="w-3 h-3" />
            <span>Press / for voice command</span>
          </div>
        </div>
      </div>

      {!showAddForm && websites?.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mb-8">
          <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold mb-2">No websites tracked yet</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Add your first website and let our AI automatically audit, optimize, and track your SEO performance
          </p>
          <Button onClick={() => setShowAddForm(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Website
          </Button>
        </div>
      )}

      {showAddForm && (
        <div className="mb-8">
          <seo.AddWebsiteForm 
            onSuccess={(website) => {
              setShowAddForm(false);
              refetch();
            }} 
          />
          <Button 
            variant="ghost" 
            className="mt-4" 
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {!showAddForm && websites?.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Websites</h2>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <seo.WebsiteCard
                key={website.id}
                website={website}
                onSelect={setSelectedWebsite}
                onAudit={handleAudit}
              />
            ))}
          </div>
        </>
      )}

      {/* Features Section */}
      {!showAddForm && websites?.length === 0 && (
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Your Complete SEO Department on Autopilot</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Everything you need to rank #1 — powered by AI, running 24/7, zero manual work required
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: 'Automated Audits',
                desc: 'AI scans your entire site for SEO issues — technical, content, and on-page problems identified instantly',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: 'Keyword Research',
                desc: 'Discovers high-value keywords your customers search for, with volume, difficulty, and opportunity scores',
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Auto-Optimization',
                desc: 'Generates perfect meta tags, descriptions, and structured data — apply with one click or fully automatic',
                gradient: 'from-orange-500 to-red-600'
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Rank Tracking',
                desc: 'Monitors your Google positions daily, alerts you to drops, and celebrates every win',
                gradient: 'from-green-500 to-emerald-600'
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Competitor Analysis',
                desc: 'See what keywords your competitors rank for and find gaps you can exploit to overtake them',
                gradient: 'from-indigo-500 to-blue-600'
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'AI Content Creation',
                desc: 'Generates comprehensive content briefs and writes full SEO-optimized articles ready to publish',
                gradient: 'from-pink-500 to-rose-600'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:border-transparent transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Add Website', desc: 'Enter your URL and industry' },
                { step: '02', title: 'AI Audit', desc: 'Comprehensive SEO analysis runs' },
                { step: '03', title: 'Auto-Fixes', desc: 'Optimizations applied automatically' },
                { step: '04', title: 'Watch It Grow', desc: 'Rankings and traffic improve daily' }
              ].map((s, idx) => (
                <div key={idx} className="text-center relative">
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-400 to-violet-400" />
                  )}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 text-white text-lg font-bold flex items-center justify-center mx-auto mb-3 relative z-10">
                    {s.step}
                  </div>
                  <h4 className="font-semibold mb-1">{s.title}</h4>
                  <p className="text-sm text-slate-300">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Metrics Section */}
      <seo.ResultsShowcase results={[]} />
      <SuccessMetrics />
    </div>
  );
}