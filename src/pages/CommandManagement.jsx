import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CommandManagement() {
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState({});

  // Fetch all commands
  const { data: commands = [], refetch } = useQuery({
    queryKey: ['commands'],
    queryFn: () => base44.entities.Command.list('-created_date', 100),
    initialData: [],
    refetchInterval: 2000 // Poll every 2 seconds for real-time feel
  });

  // Subscribe to command updates
  useEffect(() => {
    const unsubscribe = base44.entities.Command.subscribe((event) => {
      if (event.type === 'update') {
        setLiveUpdates(prev => ({
          ...prev,
          [event.id]: event.data
        }));
      }
    });
    return unsubscribe;
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'executing': return 'bg-blue-100 text-blue-800';
      case 'reasoning': return 'bg-purple-100 text-purple-800';
      case 'transcribing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'transcribing':
      case 'reasoning':
      case 'executing': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Voice Commands</h1>
          <p className="text-slate-600 mt-1">Real-time command streaming & execution</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commands List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commands.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No commands yet. Use the widget to record.</p>
                  ) : (
                    commands.map((cmd) => {
                      const live = liveUpdates[cmd.id] || cmd;
                      return (
                        <div
                          key={cmd.id}
                          onClick={() => setSelectedCommand(live)}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(live.status)}
                                <span className="font-medium text-sm text-slate-900">
                                  {live.detected_intent || 'Processing...'}
                                </span>
                                <Badge className={`${getStatusColor(live.status)}`}>
                                  {live.status}
                                </Badge>
                              </div>

                              <p className="text-xs text-slate-600 mb-2">
                                Transcription: {live.transcription?.substring(0, 80)}...
                              </p>

                              {live.context && Object.keys(live.context).length > 0 && (
                                <p className="text-xs text-slate-500">
                                  Context: {live.context.prospect_name || 'N/A'} @ {live.context.prospect_company || 'N/A'}
                                </p>
                              )}

                              <p className="text-xs text-slate-400 mt-2">
                                {formatDistanceToNow(new Date(live.created_date), { addSuffix: true })}
                              </p>
                            </div>

                            {live.processing_time_ms && (
                              <span className="text-xs text-slate-500 ml-4">{live.processing_time_ms}ms</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedCommand ? (
              <div className="space-y-3">
                {/* Transcription */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Transcription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedCommand.transcription || 'Transcribing...'}
                    </p>
                  </CardContent>
                </Card>

                {/* Reasoning */}
                {selectedCommand.claude_reasoning && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Claude Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        {selectedCommand.claude_reasoning}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Result */}
                {selectedCommand.execution_result && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto max-h-48">
                        {JSON.stringify(selectedCommand.execution_result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Error */}
                {selectedCommand.error_message && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-900">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-red-700">{selectedCommand.error_message}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500 text-sm">
                  Select a command to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}