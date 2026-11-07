import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// "Ask Richy" — clearly labeled AI assistant for voiceexecai.com.
// Works signed out. ~20 questions/day per visitor + a site-wide daily cap.
// Rate-limit counts live in AskRichyUsage (admin-only RLS). Question text is NEVER stored.
const PER_VISITOR_DAILY = 20;
const SITE_DAILY = 500;

const SITE_FACTS = `SITE FACTS (the only facts you may state about VoiceExecAI):
- VoiceExecAI (voiceexecai.com) is a voice assistant for sales reps, run by Richard Ryan LLC, 555 5th Avenue #1910, Des Moines, Iowa 50309.
- You hold the mic button in the web browser and speak (or type) a command. The AI works out what you want.
- It can: draft an email for the user to copy and send themselves; draft meeting details for the user to add to their own calendar; create a follow-up task; draft a proposal document. Commands are listed in the dashboard history.
- It does NOT send email, book meetings or log anything into a CRM (HubSpot, Salesforce, etc.) for customers yet.
- It does NOT answer or make phone calls. It does not run 24/7 on its own; it acts only when the user gives a command. There is no app in the Apple App Store or Google Play; it runs in the web browser.
- AI can make mistakes; users should check drafts before relying on them.
- Plans (paid only, no free plan, no free trial): Pro $49/month; Enterprise $999/month, set up by email.
- Deal: "Special pricing for new members: 50% off your first 3 months. We may end or change this offer at any time." Applied automatically at checkout on the monthly Pro plan.
- Cancel: email richy@voiceexecai.com before the next billing date. Refunds are handled case by case — email us.
- Payments are handled by Stripe. There is an optional "Buy us a coffee" tip ($5, $10 or $25); a tip does not include a plan.
- Contact: richy@voiceexecai.com. Privacy policy at /privacy, terms at /terms (Iowa law).`;

const RULES = `You are "Ask Richy", an AI assistant on the VoiceExecAI website. Always be clear you are an AI assistant, not a person.
Answer questions about VoiceExecAI using ONLY the SITE FACTS. You may also answer general, everyday questions (for example about sales follow-up habits or using email) briefly.
If something about VoiceExecAI is not in the SITE FACTS, say you are not sure and suggest emailing richy@voiceexecai.com. Never invent features, prices, customers, results or statistics.
Never promise refunds, discounts, credits, new features or delivery dates. Never offer any deal other than the one in SITE FACTS.
Do not give medical, legal, tax or financial/investment advice; politely decline and suggest a qualified professional.
Keep answers short (under 120 words), friendly and in plain English.`;

async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function bump(Usage: any, key: string, day: string, limit: number): Promise<boolean> {
  const rows = await Usage.filter({ key });
  const n = rows[0]?.count || 0;
  if (n >= limit) return false;
  if (rows[0]) await Usage.update(rows[0].id, { count: n + 1 });
  else await Usage.create({ key, day, count: 1 });
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const question = String(body?.question || '').trim().slice(0, 800);
    const visitorId = String(body?.visitor_id || '').slice(0, 100);
    if (!question) return Response.json({ error: 'Please type a question.' }, { status: 400 });

    let userId = '';
    try { const u = await base44.auth.me(); userId = u?.id || ''; } catch (_e) { /* signed out is fine */ }
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    const visitorKey = 'v:' + (await sha256(`${userId || visitorId || 'anon'}|${ip}|voiceexecai`)).slice(0, 32) + ':' + day;

    const Usage = base44.asServiceRole.entities.AskRichyUsage;
    if (!(await bump(Usage, `site:${day}`, day, SITE_DAILY))) {
      return Response.json({ answer: 'Ask Richy has had a lot of questions today. Please try again tomorrow, or email richy@voiceexecai.com.', limited: true });
    }
    if (!(await bump(Usage, visitorKey, day, PER_VISITOR_DAILY))) {
      return Response.json({ answer: 'You have reached today\'s limit of about 20 questions. Please come back tomorrow, or email richy@voiceexecai.com.', limited: true });
    }

    const prompt = `${RULES}\n\n${SITE_FACTS}\n\nVisitor question:\n"""${question}"""\n\nAnswer:`;
    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const text = typeof answer === 'string' ? answer : (answer?.response || answer?.text || JSON.stringify(answer));
    return Response.json({ answer: String(text).slice(0, 2000) });
  } catch (error) {
    console.error('askRichy error:', (error as Error).message);
    return Response.json({ answer: 'Sorry, Ask Richy is not available right now. Please email richy@voiceexecai.com.' }, { status: 200 });
  }
});
