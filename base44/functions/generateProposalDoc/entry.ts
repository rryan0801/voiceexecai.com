// Generate a proposal/document using Claude API (fetch-based, no SDK connection issues)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
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
    console.log('API key length:', apiKey.length, 'starts with:', apiKey.substring(0, 8));
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