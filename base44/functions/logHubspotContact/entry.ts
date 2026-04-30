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

Deno.serve(async (req) => {
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