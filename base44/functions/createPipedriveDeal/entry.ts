import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_title, company_name, deal_value, contact_name, contact_email, pipedrive_api_key } = await req.json();

    if (!deal_title || !pipedrive_api_key) {
      return Response.json({ error: 'Missing required fields: deal_title, pipedrive_api_key' }, { status: 400 });
    }

    // Step 1: Find or create organization
    const orgRes = await fetch(`https://api.pipedrive.com/v1/organizations/search?term=${encodeURIComponent(company_name)}&api_token=${pipedrive_api_key}`);
    const orgData = await orgRes.json();

    let orgId;
    if (orgData.data?.items?.length > 0) {
      orgId = orgData.data.items[0].id;
    } else {
      // Create new organization
      const createOrgRes = await fetch(
        `https://api.pipedrive.com/v1/organizations?api_token=${pipedrive_api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: company_name })
        }
      );
      const newOrg = await createOrgRes.json();
      orgId = newOrg.data.id;
    }

    // Step 2: Create deal
    const dealRes = await fetch(
      `https://api.pipedrive.com/v1/deals?api_token=${pipedrive_api_key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: deal_title,
          org_id: orgId,
          value: deal_value || 0,
          currency: 'USD',
          status: 'open'
        })
      }
    );

    const deal = await dealRes.json();

    if (!deal.success) {
      return Response.json({ error: 'Failed to create deal', details: deal }, { status: 400 });
    }

    // Step 3: Create person if contact provided
    if (contact_name) {
      await fetch(
        `https://api.pipedrive.com/v1/persons?api_token=${pipedrive_api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: contact_name,
            email: contact_email,
            org_id: orgId
          })
        }
      );
    }

    return Response.json({
      success: true,
      deal_id: deal.data.id,
      org_id: orgId,
      message: `Deal "${deal_title}" created for ${company_name}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});