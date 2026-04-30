import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NavBar from '@/components/NavBar';

export default function CRMAdapterSetup() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    adapter_name: '',
    crm_type: 'custom',
    webhook_url: '',
    webhook_secret: '',
    sync_direction: 'bidirectional'
  });
  const [expandedMapping, setExpandedMapping] = useState(null);

  const { data: adapters = [], refetch } = useQuery({
    queryKey: ['crm-adapters'],
    queryFn: () => base44.entities.CRMWebhookAdapter.list('-created_date', 100),
    initialData: [],
    refetchInterval: 30000
  });

  const handleCreate = async () => {
    if (!formData.adapter_name || !formData.webhook_url) {
      alert('Fill in all required fields');
      return;
    }

    // Default field mapping
    const defaultMapping = {
      prospect_name_field: 'firstName',
      company_field: 'companyName',
      email_field: 'email',
      phone_field: 'phone',
      deal_value_field: 'dealValue',
      deal_stage_field: 'stage'
    };

    await base44.entities.CRMWebhookAdapter.create({
      ...formData,
      client_id: 'default',
      field_mapping: defaultMapping,
      status: 'active'
    });

    setFormData({
      adapter_name: '',
      crm_type: 'custom',
      webhook_url: '',
      webhook_secret: '',
      sync_direction: 'bidirectional'
    });
    setShowForm(false);
    refetch();
  };

  const activeAdapters = adapters.filter(a => a.status === 'active').length;
  const totalEvents = adapters.reduce((sum, a) => sum + (a.events_received || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">CRM Adapter Setup</h1>
            </div>
            <p className="text-slate-500 ml-13">Connect any CRM via webhook — no coding required</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Plus className="w-4 h-4" /> New Adapter
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{adapters.length}</p>
                  <p className="text-xs text-slate-500">Total Adapters</p>
                </div>
                <Settings className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{activeAdapters}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <Check className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalEvents}</p>
                  <p className="text-xs text-slate-500">Webhooks Received</p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creation Form */}
        {showForm && (
          <Card className="mb-6 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Create New CRM Adapter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Adapter Name *
                </label>
                <Input
                  placeholder="e.g., Custom Salesforce v2"
                  value={formData.adapter_name}
                  onChange={e => setFormData({ ...formData, adapter_name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  CRM Type *
                </label>
                <select
                  value={formData.crm_type}
                  onChange={e => setFormData({ ...formData, crm_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="custom">Custom / Generic</option>
                  <option value="salesforce">Salesforce</option>
                  <option value="dynamics365">Microsoft Dynamics 365</option>
                  <option value="zoho">Zoho CRM</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Webhook URL * (from your CRM)
                </label>
                <Input
                  placeholder="https://api.voiceexec.com/webhooks/crm"
                  value={formData.webhook_url}
                  onChange={e => setFormData({ ...formData, webhook_url: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Configure your CRM to send webhooks to this URL
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Webhook Secret (optional)
                </label>
                <Input
                  type="password"
                  placeholder="Secret key for HMAC verification"
                  value={formData.webhook_secret}
                  onChange={e => setFormData({ ...formData, webhook_secret: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Sync Direction
                </label>
                <select
                  value={formData.sync_direction}
                  onChange={e => setFormData({ ...formData, sync_direction: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="inbound">Inbound (CRM → VoiceExec)</option>
                  <option value="outbound">Outbound (VoiceExec → CRM)</option>
                  <option value="bidirectional">Bidirectional (Both)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                  Create Adapter
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Next:</strong> Configure your CRM's webhook endpoint to send data to the URL you create.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adapters List */}
        <div className="space-y-3">
          {adapters.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <Settings className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>No adapters yet. Create one to start receiving webhooks.</p>
              </CardContent>
            </Card>
          ) : (
            adapters.map(adapter => (
              <Card
                key={adapter.id}
                className={adapter.status === 'error' ? 'border-red-200' : ''}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{adapter.adapter_name}</h3>
                        <Badge className={
                          adapter.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : adapter.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                        }>
                          {adapter.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {adapter.crm_type}
                        </Badge>
                      </div>

                      <div className="text-sm text-slate-600 mb-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded font-mono truncate max-w-xs">
                            {adapter.webhook_url}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span>📥 {adapter.events_received || 0} webhooks received</span>
                          <span>✅ {adapter.events_processed || 0} processed</span>
                          <span>🔄 {adapter.sync_direction}</span>
                        </div>
                      </div>

                      {adapter.status === 'error' && adapter.sync_error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mt-2 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {adapter.sync_error}
                        </div>
                      )}

                      {adapter.last_sync && (
                        <p className="text-xs text-slate-400 mt-2">
                          Last sync: {formatDistanceToNow(new Date(adapter.last_sync), { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedMapping(expandedMapping === adapter.id ? null : adapter.id)}
                      >
                        Map Fields
                      </Button>
                    </div>
                  </div>

                  {/* Field Mapping */}
                  {expandedMapping === adapter.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Field Mapping</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {Object.entries(adapter.field_mapping || {}).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 p-2 rounded">
                            <p className="text-slate-500 text-xs">{key.replace(/_/g, ' ')}</p>
                            <p className="font-mono text-slate-700">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-6 bg-slate-50 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              ❓ How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="font-semibold mb-1">1. Create Adapter</p>
              <p>Configure a webhook endpoint and field mappings for your CRM.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">2. Configure Your CRM</p>
              <p>In your CRM's webhook settings, add the endpoint URL and post events to it when deals/contacts change.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">3. Map Fields</p>
              <p>Tell VoiceExec which CRM fields map to prospect name, email, deal value, etc.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">4. Start Syncing</p>
              <p>Once activated, prospects and deals will auto-sync into VoiceExec for instant AI analysis.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}