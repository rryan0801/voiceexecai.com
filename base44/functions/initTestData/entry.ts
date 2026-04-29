import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ADMIN ONLY - Initialize test data
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create test client
    const testClient = await base44.asServiceRole.entities.Client.create({
      company_name: 'Acme Corp Test',
      api_key: 'vrep_test_' + Date.now(),
      heyrichy_account_id: 'test_account_123',
      webhook_url: 'https://webhook.site/unique-id',
      monthly_quota: 1000,
      status: 'active',
      widget_config: {
        widget_title: 'Acme Sales Assistant',
        primary_color: '#1f2937',
        secondary_color: '#ffffff',
        accent_color: '#3b82f6',
        position: 'bottom-right',
        brand_logo_url: 'https://via.placeholder.com/200x200',
        enabled_tools: ['cold_call_script', 'follow_up_email', 'objection_handler']
      }
    });

    // Create test commands
    const commands = [
      {
        client_id: testClient.id,
        audio_url: 'https://example.com/audio1.mp3',
        transcription: 'Generate a cold call script for TechCorp',
        detected_intent: 'cold_call_script',
        intent_confidence: 0.95,
        parameters: { company: 'TechCorp', industry: 'SaaS' },
        execution_result: { success: true, content: 'Hi [Name]...' },
        status: 'completed',
        processing_time_ms: 2341
      },
      {
        client_id: testClient.id,
        audio_url: 'https://example.com/audio2.mp3',
        transcription: 'Write a follow-up email',
        detected_intent: 'follow_up_email',
        intent_confidence: 0.87,
        parameters: { tone: 'friendly', recipient: 'Sarah Johnson' },
        execution_result: { success: true, content: 'Subject: Following up...' },
        status: 'completed',
        processing_time_ms: 1856
      },
      {
        client_id: testClient.id,
        audio_url: 'https://example.com/audio3.mp3',
        transcription: 'Handle price objection',
        detected_intent: 'objection_handler',
        intent_confidence: 0.92,
        parameters: { objection_type: 'price', market: 'enterprise' },
        execution_result: { success: true, content: 'Here are 3 ways to address price...' },
        status: 'completed',
        processing_time_ms: 1523
      },
      {
        client_id: testClient.id,
        audio_url: 'https://example.com/audio4.mp3',
        transcription: 'Invalid command xyz',
        status: 'failed',
        error_message: 'Intent not recognized',
        processing_time_ms: 523
      }
    ];

    await base44.asServiceRole.entities.Command.bulkCreate(commands);

    // Create usage meter
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    await base44.asServiceRole.entities.UsageMeter.create({
      client_id: testClient.id,
      month: month,
      total_requests: 100,
      transcription_requests: 34,
      intent_parsing_requests: 34,
      execution_requests: 32,
      failed_requests: 1,
      average_response_time_ms: 1560,
      cost_estimate: 12.50
    });

    return Response.json({
      success: true,
      message: 'Test data created',
      test_client_id: testClient.id,
      test_api_key: testClient.api_key,
      commands_created: commands.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});