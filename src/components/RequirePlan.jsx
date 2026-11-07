import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// Sends signed-in users who have no paid plan to /pricing (paid plans only).
// The check runs on the server (myPlan). The voice functions also check on the server.
export default function RequirePlan({ children }) {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let alive = true;
    base44.functions.invoke('myPlan', {})
      .then((res) => {
        if (!alive) return;
        const d = res?.data || {};
        setState(d.signed_in && !d.paid ? 'no_plan' : 'ok');
      })
      .catch(() => alive && setState('ok'));
    return () => { alive = false; };
  }, []);

  if (state === 'checking') {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }
  if (state === 'no_plan') return <Navigate to="/pricing?needs_plan=1" replace />;
  return children;
}
