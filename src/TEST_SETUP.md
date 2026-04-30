# VoiceExec AI - Testing Setup Guide

**Version:** 2.0  
**Date:** April 30, 2026

---

## Overview

VoiceExec AI includes **cloud-based E2E testing** with both Playwright and Cypress. Tests run in the cloud without requiring local setup.

### Testing Options

1. **Cloud UI (Recommended)** - Click buttons in the Test Runner dashboard
2. **Local CLI** - Run npm scripts on your machine (if building locally)
3. **CI/CD** - Automated tests on every deployment

---

## Option 1: Cloud UI (No Local Setup Needed)

### Access Test Runner

1. Navigate to: **http://your-app/tests** (or click "Tests" in sidebar)
2. You'll see the **Test Suite Runner** dashboard

### Running Tests

**Playwright Tests:**
- Click **"Run Playwright Tests"** button
- Watch live logs in the terminal below
- Results show in real-time with pass/fail status

**Cypress Tests:**
- Click **"Run Cypress Tests"** button
- Live logs stream as tests execute
- Get detailed results with timing per test

### Viewing Results

**For Each Test:**
- ✓ Pass indicator (green checkmark)
- ✗ Fail indicator (red X) with error details
- Execution time in milliseconds
- Clear pass/fail counts

### Log Management

**Copy Logs:**
- Click **"Copy Logs"** to copy all test output to clipboard
- Paste into documents or bug reports

**Export Logs:**
- Click **"Export Logs"** to download as .txt file
- Useful for archiving test runs
- Timestamped filename for organization

---

## Option 2: Local CLI (For Developers)

### Prerequisites

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Playwright Only

```bash
# Headless (CI mode)
npm run test:playwright

# Headed mode (see browser)
npm run test:playwright:headed

# Debug mode (step through)
npm run test:playwright:debug
```

### Run Cypress Only

```bash
# Headless (CI mode)
npm run test:cypress

# Interactive (Cypress UI)
npm run test:cypress:open
```

---

## Test Coverage

### Smoke Tests (Both Frameworks)

The test suite covers all 10 main pages:

1. **Dashboard** - Loads metrics and nav
2. **Deal Intelligence** - Scores render correctly
3. **Conversation Analytics** - Rep patterns load
4. **Meeting Copilot** - Search and Intel generation
5. **Sales Playbooks** - Create playbook form
6. **Analytics** - Charts and date ranges
7. **Voice Commands** - Command history displays
8. **Prospect Management** - Search and filter
9. **Team Performance** - Leaderboard and drilldown
10. **AutoPilot** - Sequence management

### Test Types

**Navigation Tests:**
- ✓ All sidebar links work
- ✓ Page transitions load correctly
- ✓ Back/forward navigation intact

**UI Render Tests:**
- ✓ Page titles display
- ✓ Forms and inputs visible
- ✓ Buttons and controls present
- ✓ Cards and sections render

**Integration Tests:**
- ✓ Navigation flow (4+ pages in sequence)
- ✓ Data displays on page load
- ✓ No 404 or 500 errors

---

## Test Results Interpretation

### Dashboard Results

**Test Summary Card:**
```
Total: 12
Passed: 12 (green)
Failed: 0 (red)
Duration: 45 seconds
```

**Individual Tests:**
```
✓ Dashboard loads successfully
✓ Can navigate to Deals page
✓ Deal Intelligence page renders
...
```

### What Passes Mean

- ✅ Page loads without error
- ✅ Title/heading displays
- ✅ Expected UI elements render
- ✅ Navigation links work
- ✅ No console errors

### What Failures Mean

- ❌ Page didn't load (404, timeout, etc.)
- ❌ Expected text not found
- ❌ UI elements missing
- ❌ JavaScript error during page load

**If Tests Fail:**

1. Check live logs for specific error
2. Look for timeout messages
3. Verify network connectivity
4. Check if feature being tested exists
5. Export logs and share with team

---

## CI/CD Integration

### GitHub Actions (Example)

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:playwright
      - run: npm run test:cypress
```

---

## Troubleshooting

### Tests Timeout

**Issue:** "Test timeout" or slow execution

**Solutions:**
- Check internet speed (cloud tests need good bandwidth)
- Increase timeout in playwright.config.js (current: 15s)
- Run fewer tests in parallel

### Tests Fail Due to Network

**Issue:** "Failed to reach server"

**Solutions:**
- Verify base URL in config matches your deployment
- Check if server is running
- Verify HTTPS certificates are valid

### Logs Not Updating

**Issue:** Live logs stuck or not showing new messages

**Solutions:**
- Refresh the page
- Clear browser cache
- Try a different browser

### "Admin access required"

**Issue:** Test buttons disabled or error message

**Solutions:**
- Log in as admin user
- Check your role in User settings
- Contact platform admin if needed

---

## Best Practices

1. **Run Before Deploy:** Always run tests before pushing to production
2. **Check Logs:** Review logs for warnings even if tests pass
3. **Export Failed Runs:** Save logs from failures for debugging
4. **Regular Testing:** Run smoke tests at least daily
5. **Monitor Performance:** Track test duration to catch regressions

---

## Test Files Location

```
├── tests/
│   ├── playwright/
│   │   └── smoke.spec.js        # Playwright tests
│   └── cypress/
│       └── e2e/
│           └── smoke.cy.js       # Cypress tests
├── functions/
│   ├── runPlaywrightTests.js     # Cloud test executor
│   └── runCypressTests.js        # Cloud test executor
├── playwright.config.js          # Playwright config
├── cypress.config.js             # Cypress config
└── pages/
    └── TestRunner.jsx            # Test UI dashboard
```

---

## Adding New Tests

### Playwright

Edit `tests/playwright/smoke.spec.js`:

```javascript
test('My new test', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page.locator('text=My Title')).toBeVisible();
});
```

### Cypress

Edit `tests/cypress/e2e/smoke.cy.js`:

```javascript
it('My new test', () => {
  cy.visit('/my-page');
  cy.contains('My Title').should('be.visible');
});
```

Then run tests via cloud UI or CLI to verify.

---

## Support

**For Test Issues:**
- Check this guide first
- Review live logs in Test Runner
- Export logs and send to team
- Check playwright.dev or cypress.io docs

**For Platform Issues:**
- Contact Base44 support
- Include exported test logs
- Describe what test was running

---

**Happy Testing! 🚀**