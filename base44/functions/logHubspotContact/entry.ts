// Priority #3: HubSpot CRM - create/update contact and log engagement
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUBSPOT_API = 'https://api.hubapi.com';

async function hubspotRequest(accessToken, path, options = {}) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HubSpot API error: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prospect_name, prospect_email, company_name, note, interaction_type } = await req.json();

    if (!prospect_email && !prospect_name) {
      return Response.json({ error: 'prospect_email or prospect_name required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69efbb8b3d25346a6ed84481');

    // Search for existing contact by email
    let contactId = null;
    if (prospect_email) {
      try {
        const searchRes = await hubspotRequest(accessToken, '/crm/v3/objects/contacts/search', {
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
      const createRes = await hubspotRequest(accessToken, '/crm/v3/objects/contacts', {
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

    // Log a note/engagement
    if (note && contactId) {
      await hubspotRequest(accessToken, '/crm/v3/objects/notes', {
        method: 'POST',
        body: JSON.stringify({
          properties: {
            hs_note_body: `[${interaction_type || 'note'}] ${note}`,
            hs_timestamp: new Date().toISOString()
          },
          associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }]
        })
      });
    }

    return Response.json({ success: true, contact_id: contactId, action: contactId ? 'updated' : 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});