/* eslint-disable no-undef */
import { test, expect } from '@playwright/test';

test.describe('VoiceExec AI - Smoke Tests', () => {
  test('Dashboard loads and displays metrics', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar exists
    expect(await page.locator('nav').count()).toBeGreaterThan(0);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check stat cards load
    const statCards = await page.locator('[role="main"] [class*="card"]').count();
    expect(statCards).toBeGreaterThan(0);
  });

  test('Navigation works - can visit Deals page', async ({ page }) => {
    await page.goto('/');
    
    // Click Deals link
    await page.click('a[href="/deals"]');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check we're on deals page
    await expect(page.locator('h1')).toContainText('Deal Intelligence');
  });

  test('Deal Intelligence page renders', async ({ page }) => {
    await page.goto('/deals');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Deal Intelligence');
    
    // Check KPI cards exist
    const kpiCards = await page.locator('[class*="card"]').count();
    expect(kpiCards).toBeGreaterThan(3);
  });

  test('Conversation Analytics page loads', async ({ page }) => {
    await page.goto('/conversations');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Conversation Analytics');
    
    // Check Team Reps section exists
    await expect(page.locator('text=Team Reps')).toBeVisible();
  });

  test('Meeting Copilot page loads', async ({ page }) => {
    await page.goto('/meeting-prep');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Meeting Copilot');
    
    // Check search input exists
    expect(await page.locator('input[placeholder*="prospect" i]').count()).toBeGreaterThan(0);
  });

  test('Playbooks page loads', async ({ page }) => {
    await page.goto('/playbooks');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Sales Playbooks');
    
    // Check create button exists
    expect(await page.locator('button:has-text("New Playbook")').count()).toBeGreaterThan(0);
  });

  test('Analytics page loads and displays charts', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Analytics');
    
    // Check for date range selector
    expect(await page.locator('select, [role="combobox"]').count()).toBeGreaterThan(0);
  });

  test('Commands page shows command history', async ({ page }) => {
    await page.goto('/commands');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Voice Commands');
    
    // Check for live commands list
    expect(await page.locator('[class*="space"]').count()).toBeGreaterThan(0);
  });

  test('Prospects page loads with search', async ({ page }) => {
    await page.goto('/prospects');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Prospect Database');
    
    // Check search input
    expect(await page.locator('input[placeholder*="Search"]').count()).toBeGreaterThan(0);
  });

  test('Team page displays leaderboard', async ({ page }) => {
    await page.goto('/team');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Team Performance');
    
    // Check for leaderboard element
    await expect(page.locator('text=Rep Leaderboard')).toBeVisible();
  });

  test('AutoPilot page loads', async ({ page }) => {
    await page.goto('/autopilot');
    
    // Check title
    await expect(page.locator('h1')).toContainText('AutoPilot');
    
    // Check for new sequence button
    expect(await page.locator('button:has-text("New Sequence")').count()).toBeGreaterThan(0);
  });

  test('Widget test page loads', async ({ page }) => {
    await page.goto('/widget-test');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Widget Integration');
    
    // Check embed code exists
    expect(await page.locator('pre, code').count()).toBeGreaterThan(0);
  });

  test('Mobile view accessible', async ({ page }) => {
    await page.goto('/mobile');
    
    // Check for mic button or similar mobile element
    const mobileElements = await page.locator('[class*="mic"], [class*="button"]').count();
    expect(mobileElements).toBeGreaterThan(0);
  });

  test('Mic button state transitions correctly', async ({ page }) => {
    await page.goto('/mobile');
    
    // Find the main mic button (idle state)
    const micButton = page.locator('button').filter({ has: page.locator('svg[class*="Mic"]') }).first();
    await expect(micButton).toBeVisible();
    
    // Button should be blue (idle) initially
    const initialClass = await micButton.getAttribute('class');
    expect(initialClass).toContain('bg-blue');
    
    // Start recording
    await micButton.click();
    
    // Button should become red (recording)
    await expect(micButton).toHaveClass(/bg-red/);
    
    // Stop recording
    await micButton.click();
    
    // Should transition to processing phase (check for loader or processing UI)
    const processingIndicator = page.locator('text=Processing your command');
    await expect(processingIndicator).toBeVisible({ timeout: 5000 });
    
    // Verify spinner disappears or error shows within reasonable time
    const finalState = await page.locator('.phase').getAttribute('class');
    expect(['done', 'error']).toContain(finalState);
  });

  test('No spinning state on error', async ({ page }) => {
    await page.goto('/mobile');
    
    const micButton = page.locator('button').filter({ has: page.locator('svg[class*="Mic"]') }).first();
    
    // Start and stop recording
    await micButton.click();
    await micButton.click();
    
    // Wait for processing to settle
    await page.waitForTimeout(6000);
    
    // Check that we're NOT stuck in processing phase
    const spinners = page.locator('[class*="animate-spin"]');
    const spinnerCount = await spinners.count();
    
    // Should have at most 0 visible spinners after settling
    expect(spinnerCount).toBe(0);
  });
});

test.describe('Navigation Integration', () => {
  test('All main nav items link correctly', async ({ page }) => {
    const navItems = [
      { path: '/', label: 'Dashboard' },
      { path: '/deals', label: 'Deals' },
      { path: '/conversations', label: 'Conversations' },
      { path: '/meeting-prep', label: 'Meeting Prep' },
      { path: '/playbooks', label: 'Playbooks' },
      { path: '/analytics', label: 'Analytics' },
    ];

    for (const item of navItems) {
      await page.goto(item.path);
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded by checking for main heading
      const headings = await page.locator('h1').count();
      expect(headings).toBeGreaterThan(0);
    }
  });
});