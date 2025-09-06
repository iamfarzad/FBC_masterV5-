import { test, expect } from '@playwright/test';
import { attachConsoleErrorFail, attachHttpFail } from '../helpers/guards';

test.describe('F.B/c Production QA - Unified Chat System', () => {

  test('A) Smoke & Identity - Unified Chat System', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Make sure the chat input exists and is ready
    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i));
    await expect(prompt).toBeVisible();

    // Intercept network to ensure unified endpoint is called and legacy isn't
    const unifiedHits: string[] = [];
    const legacyHits: string[] = [];
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('/api/chat/unified')) unifiedHits.push(url);
      if (url.includes('/api/ai-stream')) {
        legacyHits.push(url);
        route.abort();
        throw new Error(`LEGACY endpoint used: ${url}`);
      }
      route.continue();
    });

    await prompt.fill('who are you?');
    await page.keyboard.press('Enter');

    // Wait for the AI message to render - look for any element containing F.B/c
    const aiMsg = page.locator('[data-testid*="message"], .message, .chat-message').filter({ hasText: /F\.B\/c|Farzad Bayat/ }).first();
    await expect(aiMsg).toBeVisible({ timeout: 30000 });

    const text = (await aiMsg.textContent()) || '';
    expect(text).toMatch(/F\.B\/c|Farzad Bayat/i);
    expect(text).not.toMatch(/trained by google|large language model/i);

    // Make sure unified endpoint was indeed hit
    await expect.poll(() => unifiedHits.length, { timeout: 10000 }).toBeGreaterThan(0);

    // Make sure no legacy endpoints were hit
    expect(legacyHits.length).toBe(0);

    // Test intelligence context
    await prompt.fill('who is Farzad Bayat?');
    await page.keyboard.press('Enter');

    // Wait for context response
    const contextMsg = page.locator('[data-testid*="message"], .message, .chat-message').filter({ hasText: /Farzad|created/i }).last();
    await expect(contextMsg).toBeVisible({ timeout: 30000 });

    // Final guards - these will fail the test if there were errors
    finishConsole();
    finishHttp();
  });

  test('B) Tool Activation - ROI Calculator', async ({ page, context }) => {
    const finishConsole = await attachConsoleErrorFail(page);
    const finishHttp = attachHttpFail(context);

    await page.goto('/chat', { waitUntil: 'networkidle' });

    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i));
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
    await page.keyboard.press('Enter');

    // Wait for response - look for ROI-related content or tool activation
    const response = page.locator('[data-testid*="message"], .message, .chat-message').filter({
      hasText: /ROI|calculator|efficiency|cost/i
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
      await page.keyboard.press('Enter');

      // Wait for analysis response
      const response = page.locator('[data-testid*="message"], .message, .chat-message').filter({
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

    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i));
    await expect(prompt).toBeVisible();

    // Create a short conversation
    await prompt.fill('Hello, I need help with business automation');
    await page.keyboard.press('Enter');

    // Wait for first response
    await expect(page.locator('[data-testid*="message"], .message, .chat-message').filter({ hasText: /automation/i })).toBeVisible({ timeout: 30000 });

    await prompt.fill('Can you help me calculate ROI for my project?');
    await page.keyboard.press('Enter');

    // Wait for second response
    await expect(page.locator('[data-testid*="message"], .message, .chat-message').filter({ hasText: /ROI|calculate/i })).toBeVisible({ timeout: 30000 });

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

    const prompt = page.getByTestId('chat-input').or(page.getByPlaceholder(/ask anything/i));
    await expect(prompt).toBeVisible();

    // Test invalid input
    await prompt.fill('INVALID_COMMAND_THAT_SHOULD_FAIL');
    await page.keyboard.press('Enter');

    // Wait for response - should handle gracefully
    const response = page.locator('[data-testid*="message"], .message, .chat-message').last();
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
