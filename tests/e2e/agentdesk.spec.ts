import { test, expect } from '@playwright/test';

test.skip('sanity must fail');

test.describe('AgentDesk E2E: TC → Stage4 → PDF → Email', () => {
  test.beforeEach(async ({ context, page }) => {
    // ensure we always see the consent overlay
    await context.clearCookies();
    // Debug console messages
    page.on('console', msg => // Log removed, msg.text()));
  });

  test('happy path consulting/workshop flow', async ({ page, context, request, baseURL }) => {
    // App
    await page.goto('/chat', { waitUntil: 'networkidle' });

    // Consent
    await expect(page.getByTestId('consent-overlay')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('email-input').fill('anna@contoso.com');
    await page.getByTestId('company-input').fill('contoso.com');
    await page.getByTestId('consent-allow').click();

    // Cookie set
    const cookies = await context.cookies();
    expect(cookies.some(c => c.name.startsWith('fbc-consent'))).toBeTruthy();

    // Stage 4
    await expect(page.getByTestId('stage-indicator')).toContainText(/Stage 4 of 7/i, { timeout: 10000 });

    // Conversation
    await page.getByTestId('chat-input').fill('We spend 10 hours weekly on manual reporting.');
    await page.getByTestId('chat-send').click();
    await expect(page.locator('[data-role="message-ai"]').last()).toBeVisible({ timeout: 15000 });

    await page.getByTestId('chat-input').fill('We need training for our team to start using AI.');
    await page.getByTestId('chat-send').click();

    // Generate PDF
    await page.getByTestId('generate-pdf').click();

    const maybeDownloadBtn = page.getByTestId('download-pdf');
    if (await maybeDownloadBtn.isVisible().catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        maybeDownloadBtn.click(),
      ]);
      expect(await download.path()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(/FB-c_Summary_/);
    } else {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
      ]);
      expect(await download.path()).toBeTruthy();
    }

    // Send email (Resend)
    const sendBtn = page.getByTestId('send-email');
    if (await sendBtn.isVisible().catch(() => false)) {
      await sendBtn.click();
      await expect(page.getByText(/email sent|summary sent/i)).toBeVisible({ timeout: 15000 });

      if (process.env.RESEND_API_KEY) {
        const resp = await request.get('https://api.resend.com/emails', {
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
        });
        expect(resp.ok()).toBeTruthy();
        const data = await resp.json();
        expect((data?.data ?? []).some((m: any) => (m?.to ?? []).includes('anna@contoso.com'))).toBeTruthy();
      }
    }

    // Backend checks
    const consent = await request.get(`${baseURL}/api/consent`);
    expect(consent.ok()).toBeTruthy();
    const cj = await consent.json();
    expect(cj.allow).toBe(true);
    expect(cj.allowedDomains).toContain('contoso.com');

    const ctxResp = await request.get(`${baseURL}/api/intelligence/context`);
    expect(ctxResp.ok()).toBeTruthy();
    const ctx = await ctxResp.json();
    expect(ctx.stageKey).toBe('BACKGROUND_RESEARCH');
  });

  // Keep these skipped until you wire them
  test.skip('handles tool interactions');
  test.skip('handles error scenarios gracefully');
});
