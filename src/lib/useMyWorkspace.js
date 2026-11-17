import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Every customer needs one workspace record (the Client entity) before voice commands
// can run. Customers never had a way to make one (the form asks for internal IDs), so
// we make it for them the first time they open the app. Client RLS is owner-only.
export default function useMyWorkspace() {
  const [state, setState] = useState({ loading: true, clientId: null, error: '' });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const mine = await base44.entities.Client.filter({ status: 'active' }, '-created_date', 1);
        if (mine.length > 0) {
          if (alive) setState({ loading: false, clientId: mine[0].id, error: '' });
          return;
        }
        const me = await base44.auth.me();
        const rand = Math.random().toString(36).slice(2, 11);
        const created = await base44.entities.Client.create({
          company_name: me?.full_name ? `${me.full_name}'s workspace` : 'My workspace',
          heyrichy_account_id: me?.id || 'self',
          api_key: `vrep_${Date.now()}_${rand}`,
          status: 'active',
        });
        if (alive) setState({ loading: false, clientId: created.id, error: '' });
      } catch (e) {
        if (alive) setState({ loading: false, clientId: null, error: 'We could not set up your workspace. Please refresh the page, or email richy@voiceexecai.com.' });
      }
    })();
    return () => { alive = false; };
  }, []);

  return state;
}
