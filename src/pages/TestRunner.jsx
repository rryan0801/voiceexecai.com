import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle2, AlertCircle, Copy, Download } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { formatDistanceToNow } from 'date-fns';

export default function TestRunner() {
  const [playwrightResults, setPlaywrightResults] = useState(null);
  const [cypressResults, setCypressResults] = useState(null);
  const [running, setRunning] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const runPlaywrightTests = async () => {
    setRunning('playwright');
    setLogs([]);
    addLog('Starting Playwright tests...', 'info');
    
    try {
      addLog('Initializing browser...', 'info');
      const res = await base44.functions.invoke('runPlaywrightTests', {});
      
      setPlaywrightResults(res.data);
      
      addLog(`Completed ${res.data.totalTests} tests`, 'info');
      addLog(`Passed: ${res.data.passedTests} | Failed: ${res.data.failedTests}`, 
        res.data.failedTests === 0 ? 'success' : 'error');
      
      res.data.tests.forEach(test => {
        addLog(`${test.passed ? '✓' : '✗'} ${test.name}`, test.passed ? 'success' : 'error');
        if (test.error) addLog(`  Error: ${test.error}`, 'error');
      });
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      setPlaywrightResults({ status: 'error', error: error.message });
    } finally {
      setRunning(null);
    }
  };

  const runCypressTests = async () => {
    setRunning('cypress');
    setLogs([]);
    addLog('Starting Cypress tests...', 'info');
    
    try {
      addLog('Initializing Cypress...', 'info');
      const res = await base44.functions.invoke('runCypressTests', {});
      
      setCypressResults(res.data);
      
      addLog(`Completed ${res.data.totalTests} tests`, 'info');
      addLog(`Passed: ${res.data.passedTests} | Failed: ${res.data.failedTests}`, 
        res.data.failedTests === 0 ? 'success' : 'error');
      
      res.data.tests.forEach(test => {
        addLog(`${test.passed ? '✓' : '✗'} ${test.name} (${test.duration}ms)`, test.passed ? 'success' : 'error');
      });
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      setCypressResults({ status: 'error', error: error.message });
    } finally {
      setRunning(null);
    }
  };

  const exportLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-logs-${Date.now()}.txt`;
    a.click();
  };

  const copyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
  };

  const renderResults = (results) => {
    if (!results) return null;
    
    if (results.status === 'error') {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{results.error}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Test Results</CardTitle>
            <Badge className={results.failedTests === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {results.passedTests}/{results.totalTests} passed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-slate-50 rounded">
              <p className="text-slate-600">Total</p>
              <p className="text-xl font-bold text-slate-900">{results.totalTests}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-slate-600">Passed</p>
              <p className="text-xl font-bold text-green-600">{results.passedTests}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-slate-600">Failed</p>
              <p className="text-xl font-bold text-red-600">{results.failedTests}</p>
            </div>
          </div>

          <div className="space-y-1 mt-4">
            {results.tests.map((test, i) => (
              <div key={i} className="flex items-start gap-2 text-sm p-2 bg-slate-50 rounded">
                {test.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-slate-700">{test.name}</p>
                  {test.error && <p className="text-xs text-red-600">{test.error}</p>}
                  {test.duration && <p className="text-xs text-slate-500">{test.duration}ms</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 pt-2">
            Duration: {results.duration}s | Run: {formatDistanceToNow(new Date(results.timestamp), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Test Suite Runner</h1>
          <p className="text-slate-500 mt-1">Run cloud-based E2E tests with live logs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Controls */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Test Frameworks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={runPlaywrightTests}
                  disabled={running !== null}
                  className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {running === 'playwright' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Playwright Tests
                </Button>

                <Button
                  onClick={runCypressTests}
                  disabled={running !== null}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                >
                  {running === 'cypress' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Cypress Tests
                </Button>

                {running && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-700">Running {running} tests...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Log Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={copyLogs}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={logs.length === 0}
                >
                  <Copy className="w-4 h-4" /> Copy Logs
                </Button>
                <Button
                  onClick={exportLogs}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={logs.length === 0}
                >
                  <Download className="w-4 h-4" /> Export Logs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results & Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Playwright Results */}
            {playwrightResults && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Playwright Results</h3>
                {renderResults(playwrightResults)}
              </div>
            )}

            {/* Cypress Results */}
            {cypressResults && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Cypress Results</h3>
                {renderResults(cypressResults)}
              </div>
            )}

            {/* Live Logs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Live Logs</CardTitle>
                  {logs.length > 0 && <Badge>{logs.length} entries</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-slate-500">Run tests to see logs here...</p>
                  ) : (
                    logs.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.type === 'success'
                            ? 'text-green-400'
                            : log.type === 'error'
                            ? 'text-red-400'
                            : 'text-slate-300'
                        }
                      >
                        <span className="text-slate-500">{log.timestamp}</span> {log.message}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}