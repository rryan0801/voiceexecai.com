import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Eye, Link2, TrendingUp, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import NavBar from '@/components/NavBar';

export default function EmailEngagement() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: emailEvents = [], refetch } = useQuery({
    queryKey: ['email-events'],
    queryFn: () => base44.entities.EmailTrackingEvent.list('-created_date', 200),
    initialData: [],
    refetchInterval: 30000
  });

  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects-email'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 200),
    initialData: []
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate metrics
  const totalSent = emailEvents.length;
  const opened = emailEvents.filter(e => e.open_count > 0).length;
  const clicked = emailEvents.filter(e => e.click_count > 0).length;
  const avgEngagement = emailEvents.length > 0
    ? Math.round(emailEvents.reduce((a, e) => a + (e.engagement_score || 0), 0) / emailEvents.length)
    : 0;

  const openRate = totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Email Engagement</h1>
            </div>
            <p className="text-slate-500 ml-13">Track opens, clicks, and engagement for every email</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalSent}</p>
                  <p className="text-xs text-slate-500">Emails Sent</p>
                </div>
                <Mail className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{openRate}%</p>
                  <p className="text-xs text-slate-500">Open Rate</p>
                </div>
                <Eye className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{clickRate}%</p>
                  <p className="text-xs text-slate-500">Click Rate</p>
                </div>
                <Link2 className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{opened}</p>
                  <p className="text-xs text-slate-500">Opened</p>
                </div>
                <Eye className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{avgEngagement}</p>
                  <p className="text-xs text-slate-500">Avg Engagement</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {emailEvents.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No tracked emails yet</p>
                  ) : (
                    emailEvents.map(email => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedEmail?.id === email.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {email.subject}
                            </p>
                            <p className="text-xs text-slate-500">{email.prospect_email}</p>
                          </div>
                          <Badge className={`flex-shrink-0 ml-2 ${
                            email.status === 'clicked'
                              ? 'bg-purple-100 text-purple-800'
                              : email.status === 'opened'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {email.status}
                          </Badge>
                        </div>

                        {/* Engagement bars */}
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                          {email.open_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {email.open_count} opens
                            </span>
                          )}
                          {email.click_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" /> {email.click_count} clicks
                            </span>
                          )}
                          <span className="ml-auto text-slate-400">
                            {formatDistanceToNow(new Date(email.sent_at), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Engagement score bar */}
                        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                            style={{ width: `${email.engagement_score}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          {selectedEmail ? (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Subject</p>
                  <p className="text-sm text-slate-900">{selectedEmail.subject}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">To</p>
                  <p className="text-sm text-slate-900 break-all">{selectedEmail.prospect_email}</p>
                </div>

                <div className="pt-3 border-t space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-600">Opens</span>
                    <span className="font-bold text-sm">{selectedEmail.open_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-600">Clicks</span>
                    <span className="font-bold text-sm">{selectedEmail.click_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-600">Engagement</span>
                    <span className="font-bold text-sm">{selectedEmail.engagement_score}%</span>
                  </div>
                </div>

                {selectedEmail.first_open_at && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600 font-semibold uppercase mb-1">First Opened</p>
                    <p className="text-sm text-slate-900">
                      {format(new Date(selectedEmail.first_open_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                )}

                {selectedEmail.links_clicked && selectedEmail.links_clicked.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Links Clicked</p>
                    <div className="space-y-1">
                      {selectedEmail.links_clicked.map((link, i) => (
                        <div key={i} className="text-xs p-2 bg-slate-50 rounded">
                          <p className="text-slate-600 truncate">{link.url}</p>
                          <p className="text-slate-400">{link.click_count} clicks</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-10 pb-10 text-center text-slate-400 text-sm">
                <Mail className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                Select an email to see details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}