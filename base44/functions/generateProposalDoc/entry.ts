// Priority #5: Generate a proposal/document using Claude + return as PDF-ready HTML
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

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

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt
    });

    const htmlContent = message.content[0].text;

    // Wrap in a full printable HTML document
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

    return Response.json({
      success: true,
      html: fullHtml,
      doc_type,
      prospect_name,
      company_name
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});