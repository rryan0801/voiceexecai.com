import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Target, AlertTriangle, 
  CheckCircle, AlertCircle, ArrowRight, Zap, Search, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SEODashboard({ website, onBack }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: audits } = useQuery({
    queryKey: ['seo-audits', website.id],
    queryFn: async () => await base44.entities.SEOAudit.filter({ website_id: website.id }, '-audited_at', 5)
  });

  const { data: keywords } = useQuery({
    queryKey: ['keywords', website.id],
    queryFn: async () => await base44.entities.KeywordTracker.filter({ website_id: website.id }, '-opportunity_score', 20)
  });

  const { data: optimizations } = useQuery({
    queryKey: ['optimizations', website.id],
    queryFn: async () => await base44.entities.SEOOptimization.filter({ website_id: website.id }, '-impact_score', 20)
  });

  const auditMutation = useMutation({
    mutationFn: async () => (await base44.functions.invoke('analyzeWebsiteSEO', { website_id: website.id })).data,
    onSuccess: () => { queryClient.invalidateQueries(['seo-audits']); toast.success('SEO audit completed!'); },
    onError: (error) => toast.error('Audit failed: ' + error.message)
  });

  const applyFixesMutation = useMutation({
    mutationFn: async (autoApply) => (await base44.functions.invoke('applySEOFixes', { website_id: website.id, auto_apply: autoApply })).data,
    onSuccess: () => { queryClient.invalidateQueries(['optimizations']); toast.success('SEO fixes applied!'); }
  });

  const trackRankingsMutation = useMutation({
    mutationFn: async () => (await base44.functions.invoke('trackKeywordRankings', { website_id: website.id })).data,
    onSuccess: () => { queryClient.invalidateQueries(['keywords']); toast.success('Rankings updated!'); }
  });

  const latestAudit = audits?.[0];
  const pendingOptimizations = optimizations?.filter(o => o.status === 'pending') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="w-4 h-4 rotate-180 mr-1" />Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{website.name}</h2>
            <p className="text-sm text-slate-500">{website.url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => auditMutation.mutate()} disabled={audits?.length === 0}>
            <RefreshCw className={`w-4 h-4 mr-2 ${auditMutation.isPending ? 'animate-spin' : ''}`} />Run Audit
          </Button>
          <Button variant="outline" size="sm" onClick={() => trackRankingsMutation.mutate()}>
            <Target className="w-4 h-4 mr-2" />Update Rankings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Score', value: latestAudit?.overall_score, color: latestAudit?.overall_score >= 80 ? 'text-green-600' : latestAudit?.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600' },
              { label: 'Technical SEO', value: latestAudit?.technical_score, sub: `${latestAudit?.issues?.filter(i => i.category === 'technical').length || 0} issues` },
              { label: 'Content', value: latestAudit?.content_score, sub: `${latestAudit?.issues?.filter(i => i.category === 'content').length || 0} issues` },
              { label: 'On-Page', value: latestAudit?.on_page_score, sub: `${latestAudit?.issues?.filter(i => i.category === 'on_page').length || 0} issues` }
            ].map((card, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className={`text-4xl ${card.color || ''}`}>{card.value ?? '--'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-500">{card.sub || (latestAudit?.audited_at ? `Updated ${new Date(latestAudit.audited_at).toLocaleDateString()}` : 'No audit yet')}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" />Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                <Button variant="outline" className="justify-start" onClick={() => applyFixesMutation.mutate(false)}>
                  <AlertTriangle className="w-4 h-4 mr-2" />Generate Fixes
                  {pendingOptimizations.length > 0 && <Badge variant="secondary" className="ml-auto">{pendingOptimizations.length}</Badge>}
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => applyFixesMutation.mutate(true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />Auto-Apply All
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => setActiveTab('keywords')}>
                  <TrendingUp className="w-4 h-4 mr-2" />View Keywords
                </Button>
              </div>
            </CardContent>
          </Card>

          {latestAudit?.issues?.filter(i => i.type === 'critical').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5" />Critical Issues ({latestAudit.issues.filter(i => i.type === 'critical').length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestAudit.issues.filter(i => i.type === 'critical').slice(0, 5).map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-red-900">{issue.title}</p>
                        <p className="text-xs text-red-700 mt-1">{issue.description}</p>
                      </div>
                      {issue.auto_fixable && <Badge className="bg-green-100 text-green-700 text-xs">Auto-fixable</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All SEO Issues</CardTitle>
              <CardDescription>{latestAudit?.issues?.length || 0} issues found across {latestAudit?.pages_analyzed || 0} pages</CardDescription>
            </CardHeader>
            <CardContent>
              {latestAudit?.issues?.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No issues found!</p>
                  <p className="text-sm">Your SEO is in great shape.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestAudit.issues.map((issue, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${issue.type === 'critical' ? 'bg-red-50 border-red-200' : issue.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {issue.type === 'critical' ? <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" /> : issue.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                          <div>
                            <p className={`font-medium text-sm ${issue.type === 'critical' ? 'text-red-900' : issue.type === 'warning' ? 'text-yellow-900' : 'text-blue-900'}`}>{issue.title}</p>
                            <p className={`text-xs mt-1 ${issue.type === 'critical' ? 'text-red-700' : issue.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'}`}>{issue.description}</p>
                            {issue.url && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Globe className="w-3 h-3" />{issue.url}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={issue.type === 'critical' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'default'} className="text-xs">{issue.category}</Badge>
                          {issue.auto_fixable && <Badge className="bg-green-100 text-green-700 text-xs">Auto-fixable</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Keyword Rankings</CardTitle><CardDescription>Track your search engine positions</CardDescription></div>
                <Button size="sm" onClick={() => trackRankingsMutation.mutate()}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${trackRankingsMutation.isPending ? 'animate-spin' : ''}`} />Update All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {keywords?.length === 0 ? (
                <div className="text-center py-12"><Search className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="font-medium text-slate-500">No keywords tracked yet</p><p className="text-sm text-slate-400 mt-1">Run keyword research to find opportunities</p></div>
              ) : (
                <div className="space-y-2">
                  {keywords.map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{kw.keyword}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Vol: {kw.search_volume?.toLocaleString() || '--'}</span>
                          <span>Diff: {kw.difficulty || '--'}</span>
                          <span className={`px-2 py-0.5 rounded-full ${kw.intent === 'transactional' ? 'bg-green-100 text-green-700' : kw.intent === 'commercial' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{kw.intent}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">#{kw.current_rank || '--'}</p>
                          {kw.rank_change !== undefined && (
                            <div className={`flex items-center text-xs ${kw.rank_change > 0 ? 'text-green-600' : kw.rank_change < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                              {kw.rank_change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : kw.rank_change < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                              {kw.rank_change > 0 ? '+' : ''}{kw.rank_change}
                            </div>
                          )}
                        </div>
                        <div className="w-24">
                          <div className="text-xs text-slate-500 mb-1">Opportunity</div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-violet-600" style={{ width: `${kw.opportunity_score || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pending Optimizations</CardTitle><CardDescription>Review and approve AI-generated SEO improvements</CardDescription></CardHeader>
            <CardContent>
              {pendingOptimizations.length === 0 ? (
                <div className="text-center py-12"><CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" /><p className="font-medium text-slate-500">All caught up!</p><p className="text-sm text-slate-400 mt-1">No pending optimizations</p></div>
              ) : (
                <div className="space-y-3">
                  {pendingOptimizations.map((opt, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>{opt.optimization_type.replace('_', ' ')}</Badge>
                            <Badge variant="secondary">Impact: {opt.impact_score}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-2">Page: {opt.page_url}</p>
                          <div className="bg-slate-50 p-3 rounded text-sm">
                            <p className="font-medium text-xs text-slate-500 mb-1">Optimized Value:</p>
                            <p className="text-slate-900">{opt.optimized_value}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm"><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                          <Button size="sm" variant="outline">Skip</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}