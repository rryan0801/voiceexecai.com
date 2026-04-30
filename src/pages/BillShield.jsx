import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, DollarSign, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { formatDistanceToNow } from 'date-fns';

export default function BillShield() {
  const [uploading, setUploading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const { data: analyses = [], refetch } = useQuery({
    queryKey: ['bill-analyses'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.BillAnalysis.filter(
        { user_email: user.email },
        '-created_date',
        50
      );
    },
    initialData: []
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const user = await base44.auth.me();

      // Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;

      // Create analysis record
      const analysis = await base44.entities.BillAnalysis.create({
        user_email: user.email,
        file_name: file.name,
        file_url: fileUrl,
        analysis_status: 'pending'
      });

      // Trigger analysis
      await base44.functions.invoke('analyzeBills', {
        analysis_id: analysis.id
      });

      refetch();
      setSelectedAnalysis(analysis.id);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const selectedData = analyses.find(a => a.id === selectedAnalysis);
  const avgMonthlyLeak = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + (a.total_monthly_savings || 0), 0) / analyses.length)
    : 0;
  const totalSavingsDetected = analyses.reduce((sum, a) => sum + (a.total_monthly_savings || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">BillShield AI</h1>
          </div>
          <p className="text-xl text-slate-600 mb-2">Find where you're quietly losing money.</p>
          <p className="text-slate-500">Upload your bills, subscriptions, and receipts. We'll find the leaks.</p>
        </div>

        {/* KPI Cards */}
        {analyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Analyses</p>
                    <p className="text-3xl font-bold text-slate-900">{analyses.length}</p>
                  </div>
                  <Upload className="w-10 h-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Monthly Leak</p>
                    <p className="text-3xl font-bold text-red-600">${avgMonthlyLeak}</p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Potential Savings</p>
                    <p className="text-3xl font-bold text-green-600">${totalSavingsDetected}/mo</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base">Upload Your Bill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-6">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-4">
                    Upload a bill, receipt, or email with subscriptions
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="bill-upload"
                  />
                  <Button
                    onClick={() => document.getElementById('bill-upload').click()}
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-3 text-xs text-slate-600">
                  <p className="font-semibold mb-1">Supported:</p>
                  <ul className="space-y-0.5">
                    <li>• PDF bills & receipts</li>
                    <li>• Screenshots of bills</li>
                    <li>• Email forwarded bills</li>
                    <li>• Bank statements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyses.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No analyses yet. Upload a bill to start.
                    </p>
                  ) : (
                    analyses.map(analysis => (
                      <div
                        key={analysis.id}
                        onClick={() => setSelectedAnalysis(analysis.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedAnalysis === analysis.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-sm text-slate-900 truncate flex-1">
                            {analysis.file_name}
                          </p>
                          {analysis.analysis_status === 'complete' && (
                            <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">
                              Done
                            </Badge>
                          )}
                          {analysis.analysis_status === 'analyzing' && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs flex-shrink-0">
                              <Loader2 className="w-2.5 h-2.5 animate-spin mr-1 inline" />
                              Analyzing
                            </Badge>
                          )}
                        </div>
                        {analysis.analysis_status === 'complete' && (
                          <p className="text-xs text-red-600 font-bold">
                            Save ${analysis.total_monthly_savings}/mo
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(new Date(analysis.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {selectedData ? (
              selectedData.analysis_status === 'analyzing' ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold">Analyzing your bills...</p>
                    <p className="text-sm text-slate-500 mt-2">This usually takes 10-20 seconds.</p>
                  </CardContent>
                </Card>
              ) : selectedData.analysis_status === 'complete' ? (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-900">
                        <TrendingDown className="w-5 h-5" />
                        Your Money Leak Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Monthly Leak</p>
                          <p className="text-4xl font-bold text-red-600">
                            ${selectedData.total_monthly_savings}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Yearly Leak</p>
                          <p className="text-4xl font-bold text-red-600">
                            ${selectedData.total_yearly_savings}
                          </p>
                        </div>
                      </div>

                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                          style={{ width: `${selectedData.money_leak_score}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-600">
                        Money Leak Score: <span className="font-bold text-red-600">{selectedData.money_leak_score}/100</span>
                      </p>

                      {selectedData.analysis_details && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                          <p className="text-sm text-slate-700">{selectedData.analysis_details}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Leaks Found */}
                  {selectedData.leaks_found && selectedData.leaks_found.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Money Leaks Detected ({selectedData.leaks_found.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedData.leaks_found.map((leak, i) => (
                          <div key={i} className="border border-red-100 rounded-lg p-4 bg-red-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-slate-900">{leak.service}</p>
                                <Badge className="mt-1 bg-red-100 text-red-800 text-xs">
                                  {leak.leak_type?.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <p className="font-bold text-red-600 text-lg">
                                ${leak.potential_monthly_savings}/mo
                              </p>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{leak.action}</p>
                            <p className="text-xs text-slate-500">
                              Yearly savings: ${leak.potential_yearly_savings}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Bills Detected */}
                  {selectedData.bills_detected && selectedData.bills_detected.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Bills Analyzed ({selectedData.bills_detected.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedData.bills_detected.map((bill, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <div>
                                <p className="font-medium text-slate-900">{bill.service}</p>
                                <p className="text-xs text-slate-500">{bill.category}</p>
                              </div>
                              <p className="font-semibold text-slate-900">${bill.monthly_cost}/mo</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    Analysis failed. Try uploading again.
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p>Upload a bill to see your leak analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}