import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddWebsiteForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    url: '', name: '', industry: '', target_keywords: '', competitors: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const website = await base44.entities.Website.create({
        user_id: user.id, url: formData.url, name: formData.name, industry: formData.industry,
        target_keywords: formData.target_keywords.split(',').map(k => k.trim()).filter(Boolean),
        competitors: formData.competitors.split(',').map(c => c.trim()).filter(Boolean),
        seo_health_score: 0, created_at: new Date().toISOString()
      });
      toast.success('Website added! Starting initial audit...');
      onSuccess(website);
      setFormData({ url: '', name: '', industry: '', target_keywords: '', competitors: '' });
    } catch (error) {
      toast.error('Failed to add website: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Add New Website</CardTitle>
        <CardDescription>Enter the website you want to optimize for search engines</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Website URL *</label>
              <Input placeholder="https://example.com" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Website Name *</label>
              <Input placeholder="My Business" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Industry</label>
              <Input placeholder="e.g., SaaS, E-commerce, Healthcare" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Keywords</label>
              <Input placeholder="keyword1, keyword2, keyword3" value={formData.target_keywords} onChange={(e) => setFormData({ ...formData, target_keywords: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Competitors (URLs)</label>
            <Input placeholder="https://competitor1.com, https://competitor2.com" value={formData.competitors} onChange={(e) => setFormData({ ...formData, competitors: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Website & Start Audit'} {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}