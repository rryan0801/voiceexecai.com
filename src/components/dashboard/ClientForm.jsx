import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ClientForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    heyrichy_account_id: '',
    webhook_url: '',
    monthly_quota: 10000,
    widget_config: {
      widget_title: 'VoiceRep AI',
      primary_color: '#000000',
      secondary_color: '#FFFFFF',
      accent_color: '#0066FF',
      position: 'bottom-right',
      enabled_tools: ['cold_call_script', 'follow_up_email']
    }
  });

  const generateApiKey = () => {
    return `vrep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.Client.create({
        ...formData,
        api_key: generateApiKey(),
        status: 'active'
      });

      toast.success('Client created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create client: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <Label htmlFor="heyrichy">HeyRichyAI Account ID *</Label>
              <Input
                id="heyrichy"
                required
                value={formData.heyrichy_account_id}
                onChange={(e) => setFormData({ ...formData, heyrichy_account_id: e.target.value })}
                placeholder="Your HeyRichyAI account ID"
              />
            </div>

            <div>
              <Label htmlFor="webhook">Webhook URL (Optional)</Label>
              <Input
                id="webhook"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                placeholder="https://your-site.com/webhook"
                type="url"
              />
            </div>

            <div>
              <Label htmlFor="quota">Monthly Quota</Label>
              <Input
                id="quota"
                type="number"
                value={formData.monthly_quota}
                onChange={(e) => setFormData({ ...formData, monthly_quota: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Widget Config */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Widget Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Widget Title</Label>
                <Input
                  id="title"
                  value={formData.widget_config.widget_title}
                  onChange={(e) => setFormData({
                    ...formData,
                    widget_config: { ...formData.widget_config, widget_title: e.target.value }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  value={formData.widget_config.position}
                  onChange={(e) => setFormData({
                    ...formData,
                    widget_config: { ...formData.widget_config, position: e.target.value }
                  })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <Label htmlFor="primary">Primary Color</Label>
                <Input
                  id="primary"
                  type="color"
                  value={formData.widget_config.primary_color}
                  onChange={(e) => setFormData({
                    ...formData,
                    widget_config: { ...formData.widget_config, primary_color: e.target.value }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="accent">Accent Color</Label>
                <Input
                  id="accent"
                  type="color"
                  value={formData.widget_config.accent_color}
                  onChange={(e) => setFormData({
                    ...formData,
                    widget_config: { ...formData.widget_config, accent_color: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}