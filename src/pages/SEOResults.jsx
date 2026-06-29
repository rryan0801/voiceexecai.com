import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, DollarSign, Users, Target, Award } from 'lucide-react';
import SEOMetricCard from '@/components/seo/SEOMetricCard';
import ResultsShowcase from '@/components/seo/ResultsShowcase';
import SEOTimeline from '@/components/seo/SEOTimeline';

export default function SEOResults() {
  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => await base44.entities.Website.filter({})
  });

  const { data: results } = useQuery({
    queryKey: ['seo-results'],
    queryFn: async () => await base44.entities.SEOResult.filter({}, '-achieved_at', 20)
  });

  const { data: audits } = useQuery({
    queryKey: ['seo-audits'],
    queryFn: async () => await base44.entities.SEOAudit.filter({}, '-audited_at', 10)
  });

  // Calculate aggregate metrics
  const totalWebsites = websites?.length || 0;
  const avgHealthScore = websites?.reduce((acc, w) => acc + (w.seo_health_score || 0), 0) / totalWebsites || 0;
  const totalWins = results?.length || 0;
  const totalRevenueImpact = results?.reduce((acc, r) => acc + (r.estimated_revenue_impact || 0), 0) || 0;

  const timelineEvents = audits?.map(audit => ({
    title: `SEO Audit - ${audit.website_id}`,
    description: `Score: ${audit.overall_score}/100 | ${audit.issues?.length || 0} issues found`,
    date: new Date(audit.audited_at).toLocaleDateString(),
    completed: true,
    impact: `${audit.recommendations?.length || 0} recommendations`
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SEO Results & Impact</h1>
            <p className="text-slate-500">Real results from automated SEO optimization</p>
          </div>
        </div>
      </div>

      {/* High-Level Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SEOMetricCard
          title="Total Revenue Impact"
          value={`+$${totalRevenueImpact.toLocaleString()}`}
          subtitle="Monthly estimated"
          icon={<DollarSign className="w-6 h-6" />}
          color="from-green-500 to-emerald-600"
        />
        <SEOMetricCard
          title="Websites Optimized"
          value={totalWebsites}
          subtitle={`Avg score: ${Math.round(avgHealthScore)}/100`}
          icon={<Target className="w-6 h-6" />}
          color="from-blue-500 to-cyan-600"
        />
        <SEOMetricCard
          title="Wins Achieved"
          value={totalWins}
          subtitle="This month"
          icon={<Award className="w-6 h-6" />}
          color="from-purple-500 to-pink-600"
        />
        <SEOMetricCard
          title="Avg. Health Score"
          value={`${Math.round(avgHealthScore)}%`}
          subtitle="Across all sites"
          icon={<TrendingUp className="w-6 h-6" />}
          color="from-orange-500 to-red-600"
        />
      </div>

      {/* Recent Wins */}
      {totalWins > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Recent Wins & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsShowcase results={results || []} />
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent SEO Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <SEOTimeline events={timelineEvents.slice(0, 8)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {websites?.slice(0, 5).map((website, idx) => (
                <div key={website.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{website.name}</p>
                      <p className="text-xs text-slate-500">{website.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{website.seo_health_score || 0}/100</p>
                    <p className="text-xs text-slate-500">Health Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}