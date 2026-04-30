import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_name, company_name, deal_value, contact_email, hubspot_api_key } = await req.json();

    if (!deal_name || !hubspot_api_key) {
      return Response.json({ error: 'Missing required fields: deal_name, hubspot_api_key' }, { status: 400 });
    }

    // Step 1: Find or create company
    const companySearchRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspot_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{ propertyName: 'name', operator: 'EQ', value: company_name }]
          }],
          limit: 1
        })
      }
    );

    const companyData = await companySearchRes.json();
    let companyId;

    if (companyData.results?.length > 0) {
      companyId = companyData.results[0].id;
    } else {
      // Create new company
      const createCompanyRes = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspot_api_key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { name: company_name }
          })
        }
      );
      const newCompany = await createCompanyRes.json();
      companyId = newCompany.id;
    }

    // Step 2: Create deal
    const dealRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspot_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            dealname: deal_name,
            amount: deal_value || 0,
            dealstage: 'negotiation'
          },
          associations: [{
            types: [{ associationCategory: 'HUBSPOTDEFINED', associationTypeId: 25 }],
            id: companyId
          }]
        })
      }
    );

    const deal = await dealRes.json();

    if (!dealRes.ok) {
      return Response.json({ error: 'Failed to create deal', details: deal }, { status: 400 });
    }

    return Response.json({
      success: true,
      deal_id: deal.id,
      company_id: companyId,
      message: `Deal "${deal_name}" created for ${company_name}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});