import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Zap } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function EmailTemplateStudio() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [prospectId, setProspectId] = useState('');
  const [prospectName, setProspectName] = useState('');

  const { data: templates = [], refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-generated_at', 50),
    initialData: []
  });

  const handleGenerate = async () => {
    if (!prospectId || !prospectName) return;
    setGenerating(true);
    try {
      const user = await base44.auth.me();
      await base44.functions.invoke('generateEmailTemplate', {
        rep_email: user.email,
        prospect_id: prospectId,
        prospect_name: prospectName,
        client_id: 'default',
        template_type: 'initial_outreach'
      });
      setTimeout(() => refetch(), 1000);
      setProspectId('');
      setProspectName('');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Email Template Studio</h1>
          </div>
          <p className="text-slate-500 ml-13">AI-generated templates matching rep winning voice</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Generate Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Prospect</label>
                <Input
                  placeholder="Prospect ID"
                  value={prospectId}
                  onChange={(e) => setProspectId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Name</label>
                <Input
                  placeholder="e.g., John Smith"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating || !prospectId}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Generate
              </Button>
            </CardContent>
          </Card>

          {/* Templates List */}
          <div className="lg:col-span-2 space-y-3">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-400">
                  Generate templates to see them here
                </CardContent>
              </Card>
            ) : (
              templates.map(t => (
                <Card
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate?.id === t.id ? 'border-blue-300 bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{t.prospect_name}</p>
                        <p className="text-xs text-slate-500">{t.subject}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {t.template_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {t.inspired_by_rep_dna?.length > 0 && (
                      <p className="text-xs text-slate-600">
                        Using: {t.inspired_by_rep_dna.slice(0, 2).join(', ')}...
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Template Detail */}
        {selectedTemplate && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedTemplate.prospect_name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{selectedTemplate.subject}</p>
                </div>
                <Badge className={selectedTemplate.sent ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                  {selectedTemplate.sent ? '✓ Sent' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTemplate.body}</p>
              </div>
              {selectedTemplate.inspired_by_rep_dna?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Winning phrases used:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTemplate.inspired_by_rep_dna.slice(0, 3).map((phrase, i) => (
                      <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                        "{phrase}"
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Send Email</Button>
                <Button variant="outline" className="flex-1">Edit & Send</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}