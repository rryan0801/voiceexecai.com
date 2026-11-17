import React from 'react';
import { Link } from 'react-router-dom';
import VoiceWidget from '@/components/VoiceWidget';
import useMyWorkspace from '@/lib/useMyWorkspace';

// Full-screen voice page for phones. Makes the customer's workspace on first use.
export default function MobileWidget() {
  const { loading, clientId, error } = useMyWorkspace();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Setting up your workspace...</div>;
  }
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <p>{error}</p>
        <Link to="/dashboard" className="underline text-blue-300">Back to your dashboard</Link>
      </div>
    );
  }

  return (
    <VoiceWidget
      config={{
        clientId,
        title: 'VoiceExecAI',
        subtitle: 'Say your sales follow-up',
        contextFields: [
          { name: 'prospect_name', placeholder: 'Prospect name (optional)' },
          { name: 'prospect_company', placeholder: 'Company (optional)' },
        ],
      }}
    />
  );
}
