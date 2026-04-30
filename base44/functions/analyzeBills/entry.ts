import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_id } = await req.json();
    
    if (!analysis_id) {
      return Response.json({ error: 'Missing analysis_id' }, { status: 400 });
    }

    // Get the analysis record
    const analysis = await base44.asServiceRole.entities.BillAnalysis.get(analysis_id);
    
    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Update status to analyzing
    await base44.asServiceRole.entities.BillAnalysis.update(analysis_id, {
      analysis_status: 'analyzing'
    });

    // Call Claude to analyze the bill
    const prompt = `You are a financial analyst. A user uploaded a bill or receipt image. Extract and analyze the following:

FILE NAME: ${analysis.file_name}

YOUR TASK:
1. Extract all bills, subscriptions, or recurring charges you can identify
2. For each item, identify potential money leaks:
   - Overcharges (unusually high prices)
   - Forgotten subscriptions/trials that may have converted to paid
   - Price hikes (compare to typical market rates)
   - Duplicate services (e.g., two streaming services of same type)
   - Hidden or unexpected fees
   - Services the user might not need

3. For each leak, suggest:
   - What action to take (cancel, downgrade, compare, negotiate)
   - Estimated monthly and yearly savings

4. Calculate:
   - Total potential monthly savings
   - Total potential yearly savings
   - Money Leak Score (0-100, where 100 = maximum wasteful spending)

Return your analysis as a JSON object with this structure:
{
  "bills_detected": [
    {
      "service": "Netflix",
      "category": "Entertainment",
      "monthly_cost": 15.99,
      "issue": "forgotten_trial_or_unused"
    }
  ],
  "leaks_found": [
    {
      "service": "Netflix",
      "leak_type": "unused_subscription",
      "potential_monthly_savings": 15.99,
      "potential_yearly_savings": 191.88,
      "action": "Cancel if you don't watch regularly"
    }
  ],
  "total_monthly_savings": 147,
  "total_yearly_savings": 1764,
  "money_leak_score": 78,
  "summary": "You're likely leaking $147/month across forgotten subscriptions and overpriced services. Your biggest opportunity: cancel Netflix ($15.99), downgrade Hulu ($14.99→$7.99), and negotiate your internet bill."
}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('CLAUDE_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const claudeData = await claudeResponse.json();
    
    if (!claudeData.content || claudeData.content.length === 0) {
      throw new Error('No response from Claude');
    }

    const analysisText = claudeData.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      bills_detected: [],
      leaks_found: [],
      total_monthly_savings: 0,
      total_yearly_savings: 0,
      money_leak_score: 0,
      summary: analysisText
    };

    // Update analysis with results
    await base44.asServiceRole.entities.BillAnalysis.update(analysis_id, {
      analysis_status: 'complete',
      bills_detected: analysisResult.bills_detected || [],
      leaks_found: analysisResult.leaks_found || [],
      total_monthly_savings: analysisResult.total_monthly_savings || 0,
      total_yearly_savings: analysisResult.total_yearly_savings || 0,
      money_leak_score: analysisResult.money_leak_score || 0,
      analysis_details: analysisResult.summary || analysisText,
      analyzed_at: new Date().toISOString()
    });

    return Response.json({
      status: 'complete',
      analysis: analysisResult
    });
  } catch (error) {
    console.error('Analysis error:', error.message);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});