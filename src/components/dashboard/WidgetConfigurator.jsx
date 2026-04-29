import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function WidgetConfigurator({ client, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(client.widget_config || {});

  const handleSave = async () => {
    setLoading(true);

    try {
      await base44.entities.Client.update(client.id, {
        widget_config: config
      });

      toast.success('Widget configuration updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Configuration for {client.company_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="bg-slate-100 p-8 rounded-lg flex items-end justify-end relative h-80">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer shadow-lg"
              style={{
                backgroundColor: config.primary_color || '#000',
                color: config.secondary_color || '#fff'
              }}
            >
              🎤
            </div>
            <p className="absolute top-4 left-4 text-sm text-slate-600">Preview</p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="widget_title">Widget Title</Label>
              <Input
                id="widget_title"
                value={config.widget_title || ''}
                onChange={(e) => setConfig({ ...config, widget_title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <select
                id="position"
                value={config.position || 'bottom-right'}
                onChange={(e) => setConfig({ ...config, position: e.target.value })}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={config.primary_color || '#000000'}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="accent_color">Accent Color</Label>
                <Input
                  id="accent_color"
                  type="color"
                  value={config.accent_color || '#0066FF'}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="brand_logo">Brand Logo URL</Label>
              <Input
                id="brand_logo"
                type="url"
                value={config.brand_logo_url || ''}
                onChange={(e) => setConfig({ ...config, brand_logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Enabled Tools */}
        <div className="border-t pt-6">
          <Label className="block mb-3">Enabled Tools</Label>
          <div className="space-y-2">
            {['cold_call_script', 'follow_up_email', 'objection_handler', 'meeting_recap', 'competitor_research'].map((tool) => (
              <label key={tool} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enabled_tools?.includes(tool) || false}
                  onChange={(e) => {
                    const tools = config.enabled_tools || [];
                    if (e.target.checked) {
                      setConfig({ ...config, enabled_tools: [...tools, tool] });
                    } else {
                      setConfig({ ...config, enabled_tools: tools.filter(t => t !== tool) });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm capitalize">{tool.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}