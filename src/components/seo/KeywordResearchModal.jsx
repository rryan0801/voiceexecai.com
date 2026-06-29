import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KeywordResearchModal({ websiteId, onClose }) {
  const queryClient = useQueryClient();
  const [seedKeywords, setSeedKeywords] = useState('');
  const [competitors, setCompetitors] = useState('');

  const researchMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('researchKeywords', {
        website_id: websiteId,
        seed_keywords: seedKeywords.split(',').map(k => k.trim()).filter(Boolean),
        competitor_urls: competitors.split(',').map(c => c.trim()).filter(Boolean)
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['keywords']);
      toast.success('Keyword research complete! Found new opportunities.');
      onClose();
    },
    onError: (error) => toast.error('Research failed: ' + error.message)
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Search className="w-6 h-6" />
              Keyword Research
            </h2>
            <p className="text-sm text-slate-500">Discover high-value keywords for your industry</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              What You'll Get
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 20-30 high-value keywords with search volume</li>
              <li>• Difficulty scores (0-100 competition level)</li>
              <li>• User intent analysis (informational, commercial, transactional)</li>
              <li>• Opportunity scores to prioritize efforts</li>
              <li>• Automatic rank tracking setup</li>
            </ul>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Seed Keywords (optional)
            </label>
            <Input
              placeholder="e.g., email automation, voice commands, sales tools"
              value={seedKeywords}
              onChange={(e) => setSeedKeywords(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated. Leave empty to auto-discover from your industry.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Competitor URLs (optional)
            </label>
            <Input
              placeholder="e.g., https://competitor1.com, https://competitor2.com"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">
              We'll find keywords THEY rank for that you don't.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={() => researchMutation.mutate()}
              disabled={researchMutation.isPending}
            >
              {researchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Research
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}