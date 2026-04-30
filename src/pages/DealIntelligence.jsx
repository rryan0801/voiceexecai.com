import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp, Target, Mail, Phone, FileText, MessageSquare,
  RefreshCw, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import NavBar from '@/components/NavBar';

const ACTION_ICONS = {
  send_email: { icon: Mail, label: 'Send Email', color: 'text-blue-600' },
  schedule_call: { icon: Phone, label: 'Schedule Call', color: 'text-green-600' },
  send_proposal: { icon: FileText, label: 'Send Proposal', color: 'text-purple-600' },
  check_in: { icon: MessageSquare, label: 'Check In', color: 'text-orange-600' },
  nurture: { icon: Zap, label: 'Nurture', color: 'text-slate-600' }
};

function getScoreColor(score) {
  if (score >= 75) return 'bg-green-50 border-green-200';
  if (score >= 50) return 'bg-blue-50 border-blue-200';
  if (score >= 25) return 'bg-yellow-50 border-yellow-200';
  return 'bg-slate-50 border-slate-200';
}

function getScoreBadgeColor(score) {
  if (score >= 75) return 'bg-green-100 text-green-800';
  if (score >= 50) return 'bg-blue-100 text-blue-800';
  if (score >= 25) return 'bg-yellow-100 text-yellow-800';
  return 'bg-slate-100 text-slate-600';
}

export default function DealIntelligence() {
  const [sortBy, setSortBy] = useState('win_probability');
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: scores = [], refetch } = useQuery({
    queryKey: ['deal-scores'],
    queryFn: () => base44.entities.DealScore.list('-win_probability', 200),
    initialData: [],
    refetchInterval: 60000
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await base44.functions.invoke('calculateDealScores', { client_id: 'all' });
      setTimeout(() => refetch(), 1000);
    } finally {
      setRefreshing(false);
    }
  };

  const sortedScores = [...scores].sort((a, b) => {
    if (sortBy === 'win_probability') return b.win_probability - a.win_probability;
    if (sortBy === 'recency') return (b.recency_boost || 0) - (a.recency_boost || 0);
    if (sortBy === 'interactions') return b.interaction_count - a.interaction_count;
    return b.autopilot_progress - a.autopilot_progress;
  });

  const avgWinProbability = scores.length > 0
    ? Math.round(scores.reduce((a, s) => a + s.win_probability, 0) / scores.length)
    : 0;
  const highPotential = scores.filter(s => s.win_probability >= 75).length;
  const needsAttention = scores.filter(s => s.win_probability < 25).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Deal Intelligence</h1>
            </div>
            <p className="text-slate-500 ml-13">AI-scored pipeline — predict wins before they happen</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Calculating...' : 'Refresh Scores'}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{scores.length}</div>
              <p className="text-xs text-slate-500 mt-1">In pipeline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Win %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{avgWinProbability}%</div>
              <p className="text-xs text-slate-500 mt-1">Pipeline health</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">High Potential</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{highPotential}</div>
              <p className="text-xs text-slate-500 mt-1">75%+ probability</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{needsAttention}</div>
              <p className="text-xs text-slate-500 mt-1">Below 25%</p>
            </CardContent>
          </Card>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { value: 'win_probability', label: '⭐ Win Probability' },
            { value: 'recency', label: '⏰ Recently Active' },
            { value: 'interactions', label: '💬 Most Engaged' },
            { value: 'autopilot', label: '🤖 AutoPilot Progress' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                sortBy === opt.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Deal List */}
        <div className="space-y-3">
          {sortedScores.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <Target className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>No deals scored yet. Run your first score calculation.</p>
              </CardContent>
            </Card>
          ) : (
            sortedScores.map(score => {
              const action = ACTION_ICONS[score.recommended_action];
              const ActionIcon = action?.icon;
              const isExpanded = expandedId === score.id;

              return (
                <Card
                  key={score.id}
                  className={`border cursor-pointer transition-all ${getScoreColor(score.win_probability)}`}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : score.id)}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{score.prospect_name}</h3>
                            <p className="text-sm text-slate-500">{score.company_name}</p>
                          </div>
                        </div>

                        {/* Score gauge */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-xs">
                            <div
                              className={`h-full rounded-full transition-all ${
                                score.win_probability >= 75
                                  ? 'bg-green-500'
                                  : score.win_probability >= 50
                                  ? 'bg-blue-500'
                                  : score.win_probability >= 25
                                  ? 'bg-yellow-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${score.win_probability}%` }}
                            />
                          </div>
                          <Badge className={`flex-shrink-0 ${getScoreBadgeColor(score.win_probability)}`}>
                            {score.win_probability}%
                          </Badge>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                          <span>💬 {score.interaction_count} interactions</span>
                          {score.recency_boost > 0 && (
                            <span className="text-green-600">⚡ {score.recency_boost} recent</span>
                          )}
                          {score.autopilot_progress > 0 && (
                            <span>🤖 {score.autopilot_progress}% AutoPilot</span>
                          )}
                          {score.reply_detected && (
                            <Badge className="bg-purple-100 text-purple-800">💬 Replied</Badge>
                          )}
                          {score.last_interaction_date && (
                            <span className="text-slate-400">
                              {formatDistanceToNow(new Date(score.last_interaction_date), {
                                addSuffix: true
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recommended Action & Expand */}
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        {ActionIcon && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border">
                            <ActionIcon className={`w-4 h-4 ${action.color}`} />
                            <span className="text-xs font-medium text-slate-700">{action.label}</span>
                          </div>
                        )}
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && score.score_factors && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          {[
                            {
                              label: 'Interaction',
                              value: score.score_factors.interaction_score,
                              total: 30
                            },
                            { label: 'Recency', value: score.score_factors.recency_score, total: 25 },
                            {
                              label: 'AutoPilot',
                              value: score.score_factors.autopilot_score,
                              total: 25
                            },
                            {
                              label: 'Engagement',
                              value: score.score_factors.engagement_score,
                              total: 20
                            }
                          ].map(factor => (
                            <div key={factor.label}>
                              <p className="text-xs text-slate-600 mb-1">{factor.label}</p>
                              <p className="font-bold text-slate-900">
                                {Math.round(factor.value)}/{factor.total}
                              </p>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${(factor.value / factor.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-slate-500">
                          Last updated:{' '}
                          {score.calculated_at
                            ? formatDistanceToNow(new Date(score.calculated_at), { addSuffix: true })
                            : 'Never'}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}