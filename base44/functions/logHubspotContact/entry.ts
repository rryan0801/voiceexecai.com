// HubSpot CRM - create/update contact and log engagement using Service Key
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUBSPOT_API = 'https://api.hubapi.com';
const HUBSPOT_TOKEN = Deno.env.get('HUBSPOT_API_KEY');

async function hubspotRequest(path, options = {}) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HubSpot API error: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}


// ---- Access gates (audit 2026-11-07, second pass) ----
async function __me(req) {
  try { return await createClientFromRequest(req).auth.me(); } catch (_e) { return null; }
}
async function __gateAdmin(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role !== 'admin') return Response.json({ error: 'Admins only.' }, { status: 403 });
  return null;
}
async function __gateUser(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  return null;
}
async function __gatePaid(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role === 'admin') return null;
  const email = String(u.email || '').toLowerCase();
  try {
    const subs = await createClientFromRequest(req).asServiceRole.entities.Subscription.filter({ user_email: email });
    if (subs.some((s) => ['active', 'past_due'].includes(s.status))) return null;
  } catch (_e) { /* fall through */ }
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (key) {
      const h = { Authorization: `Bearer ${key}` };
      const c = await (await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=3`, { headers: h })).json();
      for (const cu of c?.data || []) {
        const s = await (await fetch(`https://api.stripe.com/v1/subscriptions?customer=${cu.id}&status=active&limit=1`, { headers: h })).json();
        if ((s?.data || []).length > 0) return null;
      }
    }
  } catch (_e) { /* not subscribed */ }
  return Response.json({ error: 'A paid plan is needed. See voiceexecai.com/pricing.', needs_plan: true }, { status: 402 });
}

Deno.serve(async (req) => {
  { const __denied = await __gateAdmin(req); if (__denied) return __denied; } // audit 2026-11-07, second pass

  try {
    const base44 = createClientFromRequest(req);
    const { prospect_name, prospect_email, company_name, note, interaction_type } = await req.json();

    if (!prospect_email && !prospect_name) {
      return Response.json({ error: 'prospect_email or prospect_name required' }, { status: 400 });
    }

    // Search for existing contact by email
    let contactId = null;
    if (prospect_email) {
      try {
        const searchRes = await hubspotRequest('/crm/v3/objects/contacts/search', {
          method: 'POST',
          body: JSON.stringify({
            filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: prospect_email }] }],
            limit: 1
          })
        });
        if (searchRes?.results?.length > 0) {
          contactId = searchRes.results[0].id;
        }
      } catch {}
    }

    // Create contact if not found
    if (!contactId) {
      const nameParts = (prospect_name || '').split(' ');
      const createRes = await hubspotRequest('/crm/v3/objects/contacts', {
        method: 'POST',
        body: JSON.stringify({
          properties: {
            email: prospect_email || '',
            firstname: nameParts[0] || '',
            lastname: nameParts.slice(1).join(' ') || '',
            company: company_name || ''
          }
        })
      });
      contactId = createRes.id;
    }

    // Log a note if provided
    if (note && contactId) {
      try {
        await hubspotRequest('/crm/v3/objects/notes', {
          method: 'POST',
          body: JSON.stringify({
            properties: {
              hs_note_body: `[${interaction_type || 'note'}] ${note}`,
              hs_timestamp: new Date().toISOString()
            },
            associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }]
          })
        });
      } catch (noteErr) {
        // Notes may fail if scope not granted — contact creation still succeeds
        console.log('Note creation skipped:', noteErr.message);
      }
    }

    return Response.json({ success: true, contact_id: contactId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});