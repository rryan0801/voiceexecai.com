import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageCircle, Plus, Send, Loader2, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function ConversationContextManager() {
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sessionAnalysis, setSessionAnalysis] = useState(null);

  // Fetch prospects
  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects-context'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 100),
    initialData: []
  });

  // Fetch thread for selected prospect
  const { data: thread = null, refetch: refetchThread } = useQuery({
    queryKey: ['conversation-thread', selectedProspect?.id],
    queryFn: async () => {
      if (!selectedProspect) return null;
      const res = await base44.functions.invoke('getConversationThread', {
        prospect_id: selectedProspect.id,
        client_id: selectedProspect.client_id
      });
      return res.data.thread;
    },
    enabled: !!selectedProspect
  });

  const handleCreateSession = async () => {
    if (!selectedProspect) return;
    setCreatingSession(true);
    try {
      const res = await base44.functions.invoke('createConversationSession', {
        prospect_id: selectedProspect.id,
        prospect_name: selectedProspect.prospect_name,
        client_id: selectedProspect.client_id,
        channel: 'voice'
      });
      setActiveSession(res.data.session_id);
      refetchThread();
    } finally {
      setCreatingSession(false);
    }
  };

  const handleAddTurn = async () => {
    if (!activeSession || !newMessage.trim()) return;
    try {
      await base44.functions.invoke('addConversationTurn', {
        session_id: activeSession,
        speaker: 'rep',
        message: newMessage,
        sentiment: 'neutral'
      });
      setNewMessage('');
      refetchThread();
    } catch (error) {
      console.error('Error adding turn:', error);
    }
  };

  const handleAnalyzeSession = async () => {
    if (!activeSession) return;
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke('analyzeConversationFlow', {
        session_id: activeSession
      });
      setSessionAnalysis(res.data.analysis);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await base44.functions.invoke('closeConversationSession', {
        session_id: activeSession
      });
      setActiveSession(null);
      refetchThread();
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Phase 4: Conversation Context</h1>
          </div>
          <p className="text-slate-500 ml-13">Multi-turn sessions, threading, and conversation analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prospect List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prospects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {prospects.map(prospect => (
                    <div
                      key={prospect.id}
                      onClick={() => setSelectedProspect(prospect)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedProspect?.id === prospect.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold text-sm text-slate-900">{prospect.prospect_name}</p>
                      <p className="text-xs text-slate-500">{prospect.company_name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2">
            {selectedProspect ? (
              <Tabs defaultValue="thread" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="thread">Thread</TabsTrigger>
                  <TabsTrigger value="session">Active Session</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                {/* Thread Tab */}
                <TabsContent value="thread">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Conversation Thread</CardTitle>
                        <Button
                          onClick={handleCreateSession}
                          disabled={creatingSession}
                          className="bg-blue-600 hover:bg-blue-700 gap-2"
                          size="sm"
                        >
                          {creatingSession ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          New Session
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {thread && thread.sessions.length > 0 ? (
                        <>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="p-2 bg-slate-50 rounded">
                              <p className="text-slate-600">Total Sessions</p>
                              <p className="text-xl font-bold text-slate-900">{thread.total_sessions}</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded">
                              <p className="text-slate-600">Total Turns</p>
                              <p className="text-xl font-bold text-slate-900">{thread.total_turns}</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded">
                              <p className="text-slate-600">Sessions</p>
                              <p className="text-xl font-bold text-slate-900">
                                {thread.sessions.filter(s => s.status === 'active').length} active
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Sessions</p>
                            {thread.sessions.map(session => (
                              <div
                                key={session.session_id}
                                onClick={() => setActiveSession(session.session_id)}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                  activeSession === session.session_id
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{session.channel}</Badge>
                                    <Badge className={`text-xs ${
                                      session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                      {session.status}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-slate-500">{session.turns} turns</span>
                                </div>
                                <p className="text-xs text-slate-600">{format(new Date(session.started_at), 'MMM d, h:mm a')}</p>
                                {session.sentiment_trajectory && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Sentiment: <span className="font-medium">{session.sentiment_trajectory}</span>
                                  </p>
                                )}
                                {session.deal_signals?.length > 0 && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {session.deal_signals.slice(0, 2).map((signal, i) => (
                                      <Badge key={i} className="text-xs bg-green-100 text-green-800">{signal}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {thread.conversation_history?.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Full Conversation</p>
                              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                                {thread.conversation_history.slice(-10).map((turn, i) => (
                                  <div key={i} className="p-2 bg-slate-50 rounded">
                                    <div className="flex items-start gap-2">
                                      <Badge variant="outline" className="text-xs flex-shrink-0 mt-0.5">
                                        {turn.speaker}
                                      </Badge>
                                      <p className="text-slate-700 truncate flex-1">{turn.message}</p>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1">
                                      {formatDistanceToNow(new Date(turn.timestamp), { addSuffix: true })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">No conversations yet. Create one to start.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Active Session Tab */}
                <TabsContent value="session">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Active Conversation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activeSession ? (
                        <>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                              <CheckCircle2 className="w-4 h-4 inline mr-1" />
                              Session active: {activeSession}
                            </p>
                          </div>

                          {/* Chat area */}
                          <div className="space-y-2">
                            <div className="bg-slate-50 rounded-lg p-4 h-48 overflow-y-auto space-y-2">
                              {thread?.conversation_history?.filter(t => {
                                // Find turns from active session
                                const sess = thread.sessions.find(s => s.session_id === activeSession);
                                return t.session_id === activeSession;
                              }).map((turn, i) => (
                                <div key={i} className={`flex ${turn.speaker === 'rep' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs p-3 rounded-lg text-sm ${
                                    turn.speaker === 'rep'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-200 text-slate-900'
                                  }`}>
                                    {turn.message}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTurn()}
                                placeholder="Type message..."
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              />
                              <Button onClick={handleAddTurn} size="sm" className="gap-1">
                                <Send className="w-3 h-3" /> Send
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleAnalyzeSession}
                              disabled={analyzing}
                              variant="outline"
                              className="flex-1 gap-2"
                            >
                              {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                              Analyze
                            </Button>
                            <Button onClick={handleCloseSession} variant="outline" className="flex-1">
                              Close Session
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">Select a session to continue or create a new one</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis">
                  {sessionAnalysis ? (
                    <div className="space-y-4">
                      {/* Sentiment */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Opening</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge className={`text-xs ${
                              sessionAnalysis.opening_sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              sessionAnalysis.opening_sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {sessionAnalysis.opening_sentiment}
                            </Badge>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Closing</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge className={`text-xs ${
                              sessionAnalysis.closing_sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              sessionAnalysis.closing_sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {sessionAnalysis.closing_sentiment}
                            </Badge>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Key Metrics */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Engagement Level</span>
                            <span className="font-bold">{sessionAnalysis.engagement_level}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rep Talking %</span>
                            <span className="font-bold">{sessionAnalysis.rep_to_prospect_ratio}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Topics Covered</span>
                            <span className="font-bold">{sessionAnalysis.conversation_depth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trajectory</span>
                            <Badge variant="outline" className="text-xs">{sessionAnalysis.sentiment_trajectory}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Topics & Signals */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Topics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1">
                            {sessionAnalysis.main_topics?.map((topic, i) => (
                              <p key={i} className="text-xs text-slate-700">• {topic}</p>
                            ))}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Deal Signals</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1">
                            {sessionAnalysis.deal_signals?.map((signal, i) => (
                              <Badge key={i} className="text-xs bg-green-100 text-green-800">{signal}</Badge>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Next Steps */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {sessionAnalysis.next_steps?.map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center text-slate-500">
                        Analyze the active session to see detailed insights
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  Select a prospect to manage conversations
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}