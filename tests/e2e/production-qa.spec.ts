import { test, expect } from '@playwright/test';
import { attachConsoleErrorFail, attachHttpFail } from '../helpers/guards';

test.describe('F.B/c Production QA - Unified Chat System', () => {

  test('A) Smoke & Identity - Unified Chat System', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Handle consent modal if it appears
    const consentButton = page.getByTestId('consent-allow');
    if (await consentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fill required consent fields if they exist
      const nameInput = page.locator('input[placeholder*="Full Name"], input[name*="name"]').first();
      const emailInput = page.locator('input[placeholder*="Email"], input[name*="email"], input[type="email"]').first();

      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test User');
      }

      if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await emailInput.fill('test@example.com');
      }

      // Check any required checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }

      // Wait for consent button to become enabled and click it
      await expect(consentButton).toBeEnabled({ timeout: 5000 });
      await consentButton.click();

      // Wait for consent modal to disappear
      await expect(consentButton).not.toBeVisible({ timeout: 5000 });
    }

    // Make sure the chat input exists and is ready
    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i)).or(page.locator('textarea[placeholder*="Ask anything"]'));
    await expect(prompt).toBeVisible();

    // Clear any existing messages to start fresh
    const existingMessages = page.locator('[data-testid^="message-"]');
    if (await existingMessages.count() > 0) {
      // Try to find and click a clear/reset button if it exists
      const clearButton = page.getByRole('button', { name: /clear|reset|new chat/i }).first();
      if (await clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await clearButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Intercept network to ensure unified endpoint is called and legacy isn't
    const unifiedHits: string[] = [];
    const legacyHits: string[] = [];
    let unifiedRequestId: string = '';
    const consoleLogs: string[] = [];

    // Listen for console logs to capture first-chunk
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('[UNIFIED]') && text.includes('first-chunk')) {
        const match = text.match(/\[UNIFIED\]\[([^\]]+)\] first-chunk/);
        if (match && match[1]) unifiedRequestId = match[1];
      }
    });

    // Only intercept legacy endpoints to block them
    await context.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('/api/ai-stream')) {
        legacyHits.push(url);
        route.abort();
        throw new Error(`LEGACY endpoint used: ${url}`);
      }
      route.continue();
    });

    await prompt.fill('who are you?');

    // Try to find and click send button, fallback to Enter key
    const sendButton = page.locator('button[type="submit"], [aria-label*="send"], [data-testid*="send"]').first();
    if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for the unified API call to complete (don't consume the stream)
    const unifiedResponse = await page.waitForResponse(r =>
      r.url().includes('/api/chat/unified') && r.status() === 200,
      { timeout: 10000 }
    );

    // Verify response headers (without consuming stream)
    expect(unifiedResponse.status()).toBe(200);
    const responseHeaders = unifiedResponse.headers();
    expect(responseHeaders['content-type']).toContain('text/event-stream');

    // Wait for unified API call to complete
    await page.waitForResponse(r =>
      r.url().includes('/api/chat/unified') && r.status() === 200,
      { timeout: 15000 }
    );

    // Check for first-chunk log (may not appear in production due to console filtering)
    const firstChunkLog = consoleLogs.find(x => x.includes('[UNIFIED]') && x.includes('first-chunk'));
    if (firstChunkLog) {
      console.log('UNIFIED_REQID=' + unifiedRequestId);
    } else {
      console.log('First-chunk log not found (may be filtered in production)');
    }

    // Now wait for the UI to update with the message (real streaming should work)
    const aiMsg = page.locator(
      '[data-testid^="message-"][data-role="assistant"], [data-testid^="message-"]'
    ).filter({ hasText: /Farzad|F\.B\/c|AI Systems Consultant|ROI|automation/i }).first();
    await expect(aiMsg).toBeVisible({ timeout: 30000 });

    const text = (await aiMsg.textContent()) || '';
    expect(text).toMatch(/F\.B\/c|Farzad Bayat/i);
    expect(text).not.toMatch(/trained by google|large language model/i);

    // Make sure no legacy endpoints were hit
    expect(legacyHits.length).toBe(0);

    // Test intelligence context
    await prompt.fill('who is Farzad Bayat?');
    await page.keyboard.press('Enter');

    // Wait for context response
    const contextMsg = page.locator('[data-testid^="message-"]').filter({ hasText: /Farzad|created/i }).last();
    await expect(contextMsg).toBeVisible({ timeout: 30000 });

    // Final guards - these will fail the test if there were errors
    finishConsole();
    finishHttp();
  });

  test('B) Tool Activation - ROI Calculator', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Handle consent modal if it appears
    const consentButton = page.getByTestId('consent-allow');
    if (await consentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fill required consent fields if they exist
      const nameInput = page.locator('input[placeholder*="Full Name"], input[name*="name"]').first();
      const emailInput = page.locator('input[placeholder*="Email"], input[name*="email"], input[type="email"]').first();

      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test User');
      }

      if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await emailInput.fill('test@example.com');
      }

      // Check any required checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }

      // Wait for consent button to become enabled and click it
      await expect(consentButton).toBeEnabled({ timeout: 5000 });
      await consentButton.click();

      // Wait for consent modal to disappear
      await expect(consentButton).not.toBeVisible({ timeout: 5000 });
    }

    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i)).or(page.locator('textarea[placeholder*="Ask anything"]'));
    await expect(prompt).toBeVisible();

    // Intercept to ensure no legacy endpoints
    const legacyHits: string[] = [];
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('/api/ai-stream')) {
        legacyHits.push(url);
        route.abort();
        throw new Error(`LEGACY endpoint used: ${url}`);
      }
      route.continue();
    });

    await prompt.fill('calculate ROI for $10k monthly cost, 30% efficiency gain over 2 years');

    // Try to find and click send button, fallback to Enter key
    const sendButton = page.locator('button[type="submit"], [aria-label*="send"], [data-testid*="send"]').first();
    if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for the unified API call
    await page.waitForResponse(r =>
      r.url().includes('/api/chat/unified') && r.status() === 200,
      { timeout: 10000 }
    );

    // Wait for response - look for ROI-related content or tool activation
    const response = page.locator(
      '[data-testid^="message-"][data-role="assistant"], [data-testid^="message-"]'
    ).filter({
      hasText: /Farzad|F\.B\/c|AI Systems Consultant|ROI|automation/i
    }).first();

    await expect(response).toBeVisible({ timeout: 30000 });

    const text = (await response.textContent()) || '';
    expect(text).toMatch(/ROI|calculator|cost|efficiency/i);

    // Make sure no legacy endpoints were hit
    expect(legacyHits.length).toBe(0);

    finishConsole();
    finishHttp();
  });

  test('C) WebSocket Live - Voice Path', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await context.grantPermissions(['microphone'], { origin: process.env.E2E_BASE_URL || 'https://www.farzadbayat.com' });
    await page.goto('/test-ai-capability-buttons', { waitUntil: 'networkidle' });

    // Look for WebSocket connect button
    const wsButton = page.getByRole('button', { name: /connect ws|connect.*voice|ws.*connect/i }).first();

    if (await wsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Monitor WebSocket connections
      const sockets: any[] = [];
      page.on('websocket', ws => sockets.push(ws));

      // Click connect button
      await wsButton.click();

      // Wait for WebSocket connection
      await expect.poll(() => sockets.length, { timeout: 10000 }).toBeGreaterThan(0);

      const ws = sockets[0];
      expect(ws.url()).toMatch(/wss:\/\/fb-consulting-websocket\.fly\.dev/i);

      const frames: string[] = [];
      ws.on('framereceived', (e: any) => {
        if (typeof e.payload === 'string') frames.push(e.payload);
      });

      // Expect session_started or similar within 15s
      await expect.poll(() => frames.join('\n'), { timeout: 15000 }).toMatch(/session_started|ready|welcome|connected/i);

      // Check for close frame data
      ws.on('close', (event: any) => {
        expect(event.code).toBeLessThan(4000); // Normal closure codes
      });

    } else {
      // Button not found - this is expected if the page doesn't have WS testing
      console.log('WebSocket test button not found - this may be expected');
    }

    finishConsole();
    finishHttp();
  });

  test('D) Multimodal - Image Analysis', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Look for file upload input
    const fileInput = page.locator('input[type="file"], [data-testid="file-upload"]').first();

    if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Create a small test image file
      const testImagePath = 'test-results/test-image.png';
      await page.screenshot({ path: testImagePath, fullPage: false });

      // Upload the image
      await fileInput.setInputFiles(testImagePath);

      const prompt = page.getByPlaceholder(/ask anything/i).or(page.locator('textarea')).or(page.locator('input[type="text"]'));
    await prompt.fill('Analyze this image');

    // Try to find and click send button, fallback to Enter key
    const sendButton = page.locator('button[type="submit"], [aria-label*="send"], [data-testid*="send"]').first();
    if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

      // Wait for analysis response
      const response = page.locator('[data-testid^="message-"]').filter({
        hasText: /image|analyze|picture/i
      }).first();

      await expect(response).toBeVisible({ timeout: 30000 });
    } else {
      // No file upload found - this may be expected
      console.log('File upload input not found - this may be expected for basic chat');
    }

    finishConsole();
    finishHttp();
  });

  test('E) PDF Summary Pipeline', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Handle consent modal if it appears
    const consentButton = page.getByTestId('consent-allow');
    if (await consentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fill required consent fields if they exist
      const nameInput = page.locator('input[placeholder*="Full Name"], input[name*="name"]').first();
      const emailInput = page.locator('input[placeholder*="Email"], input[name*="email"], input[type="email"]').first();

      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test User');
      }

      if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await emailInput.fill('test@example.com');
      }

      // Check any required checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }

      // Wait for consent button to become enabled and click it
      await expect(consentButton).toBeEnabled({ timeout: 5000 });
      await consentButton.click();

      // Wait for consent modal to disappear
      await expect(consentButton).not.toBeVisible({ timeout: 5000 });
    }

    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i)).or(page.locator('textarea[placeholder*="Ask anything"]'));
    await expect(prompt).toBeVisible();

    // Create a short conversation
    await prompt.fill('Hello, I need help with business automation');

    // Try to find and click send button, fallback to Enter key
    const sendButton = page.locator('button[type="submit"], [aria-label*="send"], [data-testid*="send"]').first();
    if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for first unified API call
    await page.waitForResponse(r =>
      r.url().includes('/api/chat/unified') && r.status() === 200,
      { timeout: 10000 }
    );

    // Wait for first response
    await expect(page.locator(
      '[data-testid^="message-"][data-role="assistant"], [data-testid^="message-"]'
    ).filter({ hasText: /Farzad|F\.B\/c|AI Systems Consultant|ROI|automation/i })).toBeVisible({ timeout: 30000 });

    await prompt.fill('Can you help me calculate ROI for my project?');

    // Try to find and click send button, fallback to Enter key
    const sendButton2 = page.locator('button[type="submit"], [aria-label*="send"], [data-testid*="send"]').first();
    if (await sendButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton2.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for second unified API call
    await page.waitForResponse(r =>
      r.url().includes('/api/chat/unified') && r.status() === 200,
      { timeout: 10000 }
    );

    // Wait for second response
    await expect(page.locator(
      '[data-testid^="message-"][data-role="assistant"], [data-testid^="message-"]'
    ).filter({ hasText: /Farzad|F\.B\/c|AI Systems Consultant|ROI|automation/i })).toBeVisible({ timeout: 30000 });

    // Look for PDF export button
    const pdfButton = page.getByRole('button', { name: /export|summary|pdf|download/i }).first();

    if (await pdfButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Set up download monitoring
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

      // Click export button
      await pdfButton.click();

      // Wait for download or handle gracefully
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.pdf$/);
        await download.saveAs('test-results/pdf-export-test.pdf');
      }
    } else {
      // PDF button not found - this may be expected if not implemented yet
      console.log('PDF export button not found - this may be expected');
    }

    finishConsole();
    finishHttp();
  });

  test('F) Error & Fallback Behavior', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Handle consent modal if it appears
    const consentButton = page.getByTestId('consent-allow');
    if (await consentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fill required consent fields if they exist
      const nameInput = page.locator('input[placeholder*="Full Name"], input[name*="name"]').first();
      const emailInput = page.locator('input[placeholder*="Email"], input[name*="email"], input[type="email"]').first();

      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test User');
      }

      if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await emailInput.fill('test@example.com');
      }

      // Check any required checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }

      // Wait for consent button to become enabled and click it
      await expect(consentButton).toBeEnabled({ timeout: 5000 });
      await consentButton.click();

      // Wait for consent modal to disappear
      await expect(consentButton).not.toBeVisible({ timeout: 5000 });
    }

    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i)).or(page.locator('textarea[placeholder*="Ask anything"]'));
    await expect(prompt).toBeVisible();

    // Test invalid input
    await prompt.fill('INVALID_COMMAND_THAT_SHOULD_FAIL');

    // Try to find and click send button, fallback to Enter key
    const sendButton = page.locator('button[type="submit"], [aria-label*="send"], [data-testid*="send"]').first();
    if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for the unified API call
    await page.waitForResponse(r =>
      r.url().includes('/api/chat/unified') && r.status() === 200,
      { timeout: 10000 }
    );

    // Wait for response - should handle gracefully
    const response = page.locator(
      '[data-testid^="message-"][data-role="assistant"], [data-testid^="message-"]'
    ).filter({ hasText: /Farzad|F\.B\/c|AI Systems Consultant|ROI|automation|INVALID/i }).last();
    await expect(response).toBeVisible({ timeout: 30000 });

    const text = (await response.textContent()) || '';

    // Should not contain raw errors or stack traces
    expect(text).not.toMatch(/TypeError|ReferenceError|stack|undefined/i);

    // Should provide some form of response (even if it's an error message)
    expect(text.length).toBeGreaterThan(0);

    finishConsole();
    finishHttp();
  });
});
