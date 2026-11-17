// Generate a proposal/document using Claude API (fetch-based, no SDK connection issues)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';


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
        const s = await (await fetch(`https://api.stripe.com/v1/subscriptions?customer=${cu.id}&status=active&price=price_1TdNAuIcky2cOtqj5Yz6Xu82&limit=1`, { headers: h })).json();
        if ((s?.data || []).length > 0) return null;
      }
    }
  } catch (_e) { /* not subscribed */ }
  return Response.json({ error: 'A paid plan is needed. See voiceexecai.com/pricing.', needs_plan: true }, { status: 402 });
}

// ---- Daily AI cap (ready-to-sell 2026-11-17). Server-side, per signed-in user, per UTC day.
// Counts live in the admin-only AskRichyUsage table (no command text is stored). Admins are exempt.
async function dailyCap(base44, name, limit, what) {
  let u = null;
  try { u = await base44.auth.me(); } catch (_e) { u = null; }
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role === 'admin') return null;
  const day = new Date().toISOString().slice(0, 10);
  const key = `cap:${name}:${u.id}:${day}`;
  try {
    const Usage = base44.asServiceRole.entities.AskRichyUsage;
    const rows = await Usage.filter({ key });
    const n = rows[0]?.count || 0;
    if (n >= limit) {
      return Response.json({
        error: `You have reached today's limit of ${limit} ${what}. It resets at midnight UTC. Questions? Email richy@voiceexecai.com.`,
        user_message: `You have reached today's limit of ${limit} ${what}. It resets at midnight UTC.`,
        daily_limit: true,
      }, { status: 429 });
    }
    if (rows[0]) await Usage.update(rows[0].id, { count: n + 1 });
    else await Usage.create({ key, day, count: 1 });
  } catch (e) {
    console.error('Daily cap check failed:', (e as Error)?.message);
    return Response.json({ error: 'Could not check your daily limit. Please try again in a minute.' }, { status: 503 });
  }
  return null;
}

Deno.serve(async (req) => {
  { const __denied = await __gatePaid(req); if (__denied) return __denied; } // audit 2026-11-07, second pass
  { const capped = await dailyCap(createClientFromRequest(req), 'proposal', 20, 'proposal drafts'); if (capped) return capped; }

  try {
    const base44 = createClientFromRequest(req);
    const { prospect_name, company_name, doc_type, custom_instructions, prospect_context } = await req.json();

    if (!prospect_name || !doc_type) {
      return Response.json({ error: 'prospect_name and doc_type required' }, { status: 400 });
    }

    const systemPrompt = `You are a professional business document writer. Generate a polished, detailed ${doc_type} document in clean HTML format (body content only, no <html>/<head> tags). Use professional language. Make it personalized to the recipient.`;

    const userPrompt = `Generate a ${doc_type} for:
- Prospect: ${prospect_name}
- Company: ${company_name || 'their company'}
- Past interactions: ${JSON.stringify(prospect_context?.recent_interactions || [])}
- Notes: ${prospect_context?.notes || 'None'}
- Special instructions: ${custom_instructions || 'None'}

Return only the HTML body content of the document.`;

    const rawKey = Deno.env.get('CLAUDE_API_KEY') || '';
    // Sanitize: keep only printable ASCII characters
    const apiKey = rawKey.replace(/[^\x20-\x7E]/g, '').trim();

    const headers = new Headers();
    headers.set('x-api-key', apiKey);
    headers.set('anthropic-version', '2023-06-01');
    headers.set('content-type', 'application/json');

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Claude API error: ${claudeRes.status} ${err}`);
    }

    const claudeData = await claudeRes.json();
    const htmlContent = claudeData.content[0].text;

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 40px; color: #333; line-height: 1.6; }
    h1 { color: #1a1a2e; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0066cc; }
    p { margin: 12px 0; }
    .header { text-align: right; color: #666; font-size: 14px; margin-bottom: 40px; }
    @media print { body { margin: 0; padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  ${htmlContent}
</body>
</html>`;

    return Response.json({ success: true, html: fullHtml, doc_type, prospect_name, company_name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});