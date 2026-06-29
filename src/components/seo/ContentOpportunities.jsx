import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContentOpportunities({ websiteId }) {
  const queryClient = useQueryClient();
  const [showBriefForm, setShowBriefForm] = useState(false);
  const [topic, setTopic] = useState('');

  const { data: opportunities } = useQuery({
    queryKey: ['content-opportunities', websiteId],
    queryFn: async () => await base44.entities.ContentOpportunity.filter({ website_id: websiteId }, '-priority_score', 10)
  });

  const briefMutation = useMutation({
    mutationFn: async (topic) => (await base44.functions.invoke('generateContentBriefs', { website_id: websiteId, topic })).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['content-opportunities']);
      setShowBriefForm(false);
      setTopic('');
      toast.success('Content brief generated!');
    }
  });

  const handleGenerateBrief = () => {
    if (!topic.trim()) return;
    briefMutation.mutate(topic);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Content Opportunities</CardTitle>
            <CardDescription>AI-identified topics that will drive traffic</CardDescription>
          </div>
          <Button onClick={() => setShowBriefForm(!showBriefForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />New Topic
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showBriefForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <label className="text-sm font-medium mb-2 block">What topic should we create content for?</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'How to automate email management'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateBrief()}
              />
              <Button onClick={handleGenerateBrief} disabled={briefMutation.isPending}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Brief
              </Button>
            </div>
          </div>
        )}

        {opportunities?.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No content opportunities yet</p>
            <p className="text-sm">Add a topic above or run competitor analysis to find gaps</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities?.map((opp, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{opp.content_type?.replace('_', ' ') || 'Blog Post'}</Badge>
                      <Badge variant="secondary">Priority: {opp.priority_score}</Badge>
                      <Badge className={opp.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {opp.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{opp.topic}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {opp.search_volume?.toLocaleString()} searches/mo
                      </span>
                      <span>Est. traffic: {opp.estimated_traffic_potential?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {opp.content_brief && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    <p className="font-medium text-xs text-slate-500 mb-2">Suggested Title:</p>
                    <p className="text-slate-900">{opp.content_brief.suggested_title}</p>
                  </div>
                )}

                {opp.ai_generated_content && (
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Content ready to publish</span>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    View Brief
                  </Button>
                  {opp.ai_generated_content && (
                    <Button size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}