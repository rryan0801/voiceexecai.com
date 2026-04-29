import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function CommandHistory({ commands }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending':
      case 'transcribing':
      case 'parsing':
      case 'executing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {commands.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No commands yet</p>
          ) : (
            commands.map((cmd) => (
              <div key={cmd.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">
                      {cmd.detected_intent || 'Processing...'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {cmd.transcription?.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDistanceToNow(new Date(cmd.created_date), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(cmd.status)}>
                      {cmd.status}
                    </Badge>
                    {cmd.processing_time_ms && (
                      <span className="text-xs text-slate-500">
                        {cmd.processing_time_ms}ms
                      </span>
                    )}
                  </div>
                </div>

                {cmd.error_message && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs text-red-700">{cmd.error_message}</p>
                  </div>
                )}

                {cmd.execution_result && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-xs text-green-700 font-mono">
                      {JSON.stringify(cmd.execution_result).substring(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}