import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { seoApi } from '@/modules/seo/api/seoApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, ExternalLink, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompetitorAnalysis({ websiteId }) {
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async () => await seoApi.analyzeCompetitors(websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['competitor-analysis', websiteId]);
      toast.success('Competitor analysis complete!');
    },
    onError: (error) => toast.error('Analysis failed: ' + error.message)
  });

  const { data: competitors } = useQuery({
    queryKey: ['competitor-analysis', websiteId],
    queryFn: async () => await seoApi.getCompetitors(websiteId)
  });

  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Competitor Analysis</CardTitle>
          <CardDescription>No competitors specified. Add competitor URLs to your website settings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Competitor Intelligence</CardTitle>
            <CardDescription>See what keywords your competitors rank for and find gaps</CardDescription>
          </div>
          <Button onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending}>
            {analyzeMutation.isPending ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitors.map((competitor, idx) => (
            <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                    {competitor.competitor_url?.replace('https://', '').split('.')[0].charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{competitor.competitor_url}</p>
                    <p className="text-xs text-slate-500">Competitor #{idx + 1}</p>
                  </div>
                </div>
                <a href={competitor.competitor_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Est. Monthly Traffic</p>
                  <p className="font-semibold text-lg">{competitor.estimated_monthly_traffic?.toLocaleString() || '--'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Domain Authority</p>
                  <p className="font-semibold text-lg">{competitor.domain_authority || '--'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Keywords Ranked</p>
                  <p className="font-semibold text-lg">{competitor.total_keywords?.toLocaleString() || '--'}</p>
                </div>
              </div>
              {competitor.content_gaps?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Content Gaps ({competitor.content_gaps.length})</p>
                  <div className="space-y-1">
                    {competitor.content_gaps.slice(0, 3).map((gap, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        {gap.keyword} - They rank #{gap.their_position}, you rank #{gap.our_position || '--'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}