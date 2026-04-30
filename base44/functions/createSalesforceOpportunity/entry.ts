import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_name, opportunity_name, amount, close_date, contact_name, contact_email, salesforce_instance_url, salesforce_access_token } = await req.json();

    if (!opportunity_name || !company_name || !salesforce_instance_url || !salesforce_access_token) {
      return Response.json({ error: 'Missing required fields: opportunity_name, company_name, salesforce_instance_url, salesforce_access_token' }, { status: 400 });
    }

    // Step 1: Find or create Account (company)
    const accountQuery = `SELECT Id FROM Account WHERE Name = '${company_name}' LIMIT 1`;
    const accountSearchRes = await fetch(
      `${salesforce_instance_url}/services/data/v57.0/query?q=${encodeURIComponent(accountQuery)}`,
      { headers: { 'Authorization': `Bearer ${salesforce_access_token}` } }
    );
    const accountData = await accountSearchRes.json();
    
    let accountId;
    if (accountData.records?.length > 0) {
      accountId = accountData.records[0].Id;
    } else {
      // Create new account
      const createAccountRes = await fetch(
        `${salesforce_instance_url}/services/data/v57.0/sobjects/Account/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${salesforce_access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Name: company_name })
        }
      );
      const newAccount = await createAccountRes.json();
      accountId = newAccount.id;
    }

    // Step 2: Create Opportunity
    const opportunityRes = await fetch(
      `${salesforce_instance_url}/services/data/v57.0/sobjects/Opportunity/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${salesforce_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: opportunity_name,
          AccountId: accountId,
          Amount: amount || null,
          CloseDate: close_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          StageName: 'Prospecting'
        })
      }
    );

    const opportunity = await opportunityRes.json();

    if (!opportunityRes.ok) {
      return Response.json({ error: 'Failed to create opportunity', details: opportunity }, { status: 400 });
    }

    // Step 3: Create Contact if email provided
    if (contact_email) {
      await fetch(
        `${salesforce_instance_url}/services/data/v57.0/sobjects/Contact/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${salesforce_access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            FirstName: contact_name?.split(' ')[0] || 'Unknown',
            LastName: contact_name?.split(' ').slice(1).join(' ') || 'Contact',
            Email: contact_email,
            AccountId: accountId
          })
        }
      );
    }

    return Response.json({
      success: true,
      opportunity_id: opportunity.id,
      account_id: accountId,
      message: `Opportunity "${opportunity_name}" created for ${company_name}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});