import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Zap, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const DEMO_SCENARIOS = [
  {
    command: '"Log a call with Sarah at Acme Corp. Strong interest. Follow up Thursday."',
    steps: [
      { icon: '🎤', text: 'Voice captured & transcribed', delay: 600 },
      { icon: '🧠', text: 'Intent parsed: log_call + create_task', delay: 1400 },
      { icon: '📋', text: 'HubSpot: Call logged for Acme Corp', delay: 2200 },
      { icon: '📅', text: 'Task created: Follow up Thursday', delay: 3000 },
      { icon: '✅', text: 'Done in 2.1 seconds', delay: 3600 },
    ]
  },
  {
    command: '"Send a follow-up email to John at TechCorp about the proposal we sent."',
    steps: [
      { icon: '🎤', text: 'Voice captured & transcribed', delay: 600 },
      { icon: '🧠', text: 'Intent parsed: send_email + find_contact', delay: 1400 },
      { icon: '🔍', text: 'CRM: John at TechCorp found', delay: 2200 },
      { icon: '📧', text: 'Outlook: Follow-up email drafted & sent', delay: 3000 },
      { icon: '✅', text: 'Done in 2.4 seconds', delay: 3600 },
    ]
  },
  {
    command: '"Mark the deal with BlueSky as won and notify the team on Slack."',
    steps: [
      { icon: '🎤', text: 'Voice captured & transcribed', delay: 600 },
      { icon: '🧠', text: 'Intent parsed: update_deal + notify_team', delay: 1400 },
      { icon: '🏆', text: 'Salesforce: BlueSky deal → Closed Won', delay: 2200 },
      { icon: '💬', text: 'Slack: #sales notified with deal details', delay: 3000 },
      { icon: '✅', text: 'Done in 1.9 seconds', delay: 3600 },
    ]
  }
];

export default function InteractiveDemo() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [pulse, setPulse] = useState(false);
  const timeoutsRef = useRef([]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const runDemo = (scenarioIndex) => {
    clearAll();
    setVisibleSteps([]);
    setIsRunning(true);
    setPulse(true);

    const scenario = DEMO_SCENARIOS[scenarioIndex];
    scenario.steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setVisibleSteps(prev => [...prev, i]);
        if (i === scenario.steps.length - 1) {
          setIsRunning(false);
          setPulse(false);
        }
      }, step.delay);
      timeoutsRef.current.push(t);
    });
  };

  useEffect(() => {
    return () => clearAll();
  }, []);

  const handleScenario = (i) => {
    setActiveScenario(i);
    setVisibleSteps([]);
    setIsRunning(false);
    setPulse(false);
    clearAll();
  };

  const scenario = DEMO_SCENARIOS[activeScenario];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold mb-4">
            <Zap className="w-3 h-3" />
            Interactive Demo — See It In Action
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Try a voice command</h2>
          <p className="text-lg text-slate-500">Pick a scenario and watch VoiceExecAI execute it in real-time.</p>
        </div>

        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          {/* Scenario Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto">
            {DEMO_SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleScenario(i)}
                className={`flex-1 min-w-[120px] px-4 py-3.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  activeScenario === i
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Scenario {i + 1}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">
            {/* Command Display */}
            <div className="mb-8">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-semibold">Voice Command</p>
              <div className="flex items-start gap-4 bg-slate-800 rounded-2xl p-5 border border-slate-700">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  pulse ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' : 'bg-slate-600'
                }`}>
                  {pulse ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-slate-300" />}
                </div>
                <p className="text-white text-lg leading-relaxed font-medium">{scenario.command}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="mb-8">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-4 font-semibold">Execution Pipeline</p>
              <div className="space-y-3">
                {scenario.steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                      visibleSteps.includes(i)
                        ? i === scenario.steps.length - 1
                          ? 'bg-green-900/30 border-green-700 text-green-300'
                          : 'bg-blue-900/30 border-blue-800 text-blue-200'
                        : 'bg-slate-800/50 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-lg w-6 text-center">{step.icon}</span>
                    <span className="text-sm font-medium">{step.text}</span>
                    {visibleSteps.includes(i) && i < scenario.steps.length - 1 && (
                      <CheckCircle className="w-4 h-4 ml-auto text-blue-400 flex-shrink-0" />
                    )}
                    {!visibleSteps.includes(i) && (
                      <Clock className="w-4 h-4 ml-auto text-slate-700 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => runDemo(activeScenario)}
                disabled={isRunning}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                <Mic className="w-5 h-5" />
                {isRunning ? 'Running...' : visibleSteps.length > 0 ? 'Run Again' : 'Run Demo'}
              </button>
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-4 text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                Try with real data <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}