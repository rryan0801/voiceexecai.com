import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Globe, Search, BarChart3, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WebsiteCard from '@/components/seo/WebsiteCard';
import AddWebsiteForm from '@/components/seo/AddWebsiteForm';
import SEODashboard from '@/components/seo/SEODashboard';

export default function SEOAutomator() {
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: websites, isLoading, refetch } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Website.filter({ user_id: user.id }, '-created_at');
    }
  });

  const handleAudit = async (websiteId) => {
    try {
      const response = await base44.functions.invoke('analyzeWebsiteSEO', { website_id: websiteId });
      if (response.data) {
        refetch();
        if (selectedWebsite?.id === websiteId) {
          // Refresh dashboard if viewing this site
        }
      }
    } catch (error) {
      console.error('Audit error:', error);
    }
  };

  if (selectedWebsite) {
    return <SEODashboard website={selectedWebsite} onBack={() => setSelectedWebsite(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SEO Automator</h1>
            <p className="text-slate-500">Fully automated SEO optimization — more visitors, zero manual work</p>
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
          <AddWebsiteForm 
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
              <WebsiteCard
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
          <h2 className="text-2xl font-bold text-center mb-8">What SEO Automator Does</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: 'Automated Audits',
                desc: 'AI scans your entire site for SEO issues — technical, content, and on-page problems identified instantly'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Keyword Research',
                desc: 'Discovers high-value keywords your customers search for, with volume, difficulty, and opportunity scores'
              },
              {
                icon: <Plus className="w-6 h-6" />,
                title: 'Auto-Optimization',
                desc: 'Generates perfect meta tags, descriptions, and structured data — apply with one click or fully automatic'
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Rank Tracking',
                desc: 'Monitors your Google positions daily, alerts you to drops, and celebrates wins'
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: 'Competitor Analysis',
                desc: 'See what keywords your competitors rank for and find gaps you can exploit'
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Traffic Insights',
                desc: 'Track organic traffic growth, top landing pages, and keyword performance over time'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}