import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { chromium } from 'npm:playwright@1.40.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const baseURL = Deno.env.get('BASE_URL') || 'https://preview-sandbox--69f271da3dbd30c56bc97f06.base44.app';
    const browser = await chromium.launch();
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    const results = {
      timestamp: new Date().toISOString(),
      status: 'running',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
    };

    const testCases = [
      { name: 'Dashboard loads', url: '/', checkText: 'Dashboard' },
      { name: 'Deals page loads', url: '/deals', checkText: 'Deal Intelligence' },
      { name: 'Conversations page loads', url: '/conversations', checkText: 'Conversation Analytics' },
      { name: 'Meeting Prep page loads', url: '/meeting-prep', checkText: 'Meeting Copilot' },
      { name: 'Playbooks page loads', url: '/playbooks', checkText: 'Sales Playbooks' },
      { name: 'Analytics page loads', url: '/analytics', checkText: 'Analytics' },
      { name: 'Commands page loads', url: '/commands', checkText: 'Voice Commands' },
      { name: 'Prospects page loads', url: '/prospects', checkText: 'Prospect Database' },
      { name: 'Team page loads', url: '/team', checkText: 'Team Performance' },
      { name: 'AutoPilot page loads', url: '/autopilot', checkText: 'AutoPilot' },
    ];

    for (const test of testCases) {
      try {
        await page.goto(`${baseURL}${test.url}`, { waitUntil: 'networkidle', timeout: 15000 });
        const hasText = await page.locator(`text=${test.checkText}`).isVisible({ timeout: 5000 }).catch(() => false);
        
        const passed = hasText;
        results.tests.push({
          name: test.name,
          passed,
          url: test.url,
          timestamp: new Date().toISOString(),
        });
        
        results.totalTests++;
        if (passed) results.passedTests++;
        else results.failedTests++;
      } catch (error) {
        results.tests.push({
          name: test.name,
          passed: false,
          error: error.message,
          url: test.url,
          timestamp: new Date().toISOString(),
        });
        results.totalTests++;
        results.failedTests++;
      }
    }

    await context.close();
    await browser.close();

    results.status = results.failedTests === 0 ? 'passed' : 'failed';
    results.duration = Math.round((Date.now() - new Date(results.timestamp).getTime()) / 1000);

    return Response.json(results);
  } catch (error) {
    return Response.json(
      { error: error.message, status: 'error' },
      { status: 500 }
    );
  }
});