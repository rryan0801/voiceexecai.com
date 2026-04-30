import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle2, AlertCircle, Copy, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickTestRunner() {
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const runTests = async (framework) => {
    setRunning(framework);
    setLogs([]);
    setShowLogs(true);
    addLog(`Starting ${framework} tests...`, 'info');

    try {
      const res = await base44.functions.invoke(
        framework === 'playwright' ? 'runPlaywrightTests' : 'runCypressTests',
        {}
      );

      setResults(res.data);
      addLog(
        `Completed ${res.data.totalTests} tests: ${res.data.passedTests} passed, ${res.data.failedTests} failed`,
        res.data.failedTests === 0 ? 'success' : 'error'
      );

      res.data.tests.slice(0, 5).forEach(test => {
        addLog(`${test.passed ? '✓' : '✗'} ${test.name}`, test.passed ? 'success' : 'error');
      });
      
      if (res.data.tests.length > 5) {
        addLog(`... and ${res.data.tests.length - 5} more tests`, 'info');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      setResults({ status: 'error', error: error.message });
    } finally {
      setRunning(null);
    }
  };

  const copyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
  };

  return (
    <Card className="border-slate-200 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-blue-600" />
            Quick Test Monitor
          </CardTitle>
          <Link to="/tests" className="text-xs text-blue-600 hover:underline">
            Full Dashboard →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => runTests('playwright')}
            disabled={running !== null}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            {running === 'playwright' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Playwright
          </Button>
          <Button
            onClick={() => runTests('cypress')}
            disabled={running !== null}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            {running === 'cypress' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Cypress
          </Button>
          {logs.length > 0 && (
            <Button
              onClick={copyLogs}
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs ml-auto"
            >
              <Copy className="w-3 h-3" /> Copy Logs
            </Button>
          )}
        </div>

        {/* Results Summary */}
        {results && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">Total</p>
              <p className="font-bold text-slate-900">{results.totalTests}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-slate-600">Passed</p>
              <p className="font-bold text-green-700">{results.passedTests}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-slate-600">Failed</p>
              <p className="font-bold text-red-700">{results.failedTests}</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {results && (
          <div className="flex items-center gap-2">
            {results.failedTests === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">All tests passed ✓</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{results.failedTests} test(s) failed</span>
              </>
            )}
          </div>
        )}

        {/* Logs Toggle & Display */}
        {logs.length > 0 && (
          <div>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs text-blue-600 hover:underline mb-2"
            >
              {showLogs ? '▼ Hide' : '▶ Show'} Logs ({logs.length})
            </button>
            {showLogs && (
              <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs max-h-40 overflow-y-auto space-y-0.5">
                {logs.map((log, i) => (
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
                    <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {running && (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running {running} tests...
          </div>
        )}

        {results && results.status === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{results.error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}