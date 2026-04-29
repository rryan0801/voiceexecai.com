import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsList({ clients, loading, onClientSelect, onRefresh }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getEmbedCode = (apiKey) => {
    return `<script src="https://voicerep.app/voicerep-widget.js" data-api-key="${apiKey}"><\/script>`;
  };

  if (loading) {
    return <div className="text-center py-12">Loading clients...</div>;
  }

  return (
    <div className="space-y-4">
      {clients.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            No clients yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        clients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{client.company_name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {client.heyrichy_account_id && `HeyRichy ID: ${client.heyrichy_account_id}`}
                  </p>
                </div>
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* API Key */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-slate-600 block mb-2">API Key</label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white p-2 rounded flex-1 font-mono border border-slate-200">
                    {client.api_key.substring(0, 10)}...
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(client.api_key)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Embed Code */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-xs font-medium text-slate-600 block mb-2">Widget Embed Code</label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white p-2 rounded flex-1 font-mono border border-slate-200 overflow-hidden text-ellipsis">
                    &lt;script ... data-api-key="{client.api_key.substring(0, 8)}..."&gt;
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(getEmbedCode(client.api_key))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClientSelect(client)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}