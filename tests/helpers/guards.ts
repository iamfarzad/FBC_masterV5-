import { Page, BrowserContext, expect } from '@playwright/test';

export async function attachConsoleErrorFail(page: Page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return () => {
    expect.soft(errors, `Console errors:\n${errors.join('\n')}`).toEqual([]);
  };
}

export function attachHttpFail(context: BrowserContext) {
  const bad: string[] = [];
  context.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    if (status >= 400 && !url.includes('favicon') && !url.includes('.ico')) {
      bad.push(`${status} ${url}`);
    }
  });
  return () => {
    expect.soft(bad, `HTTP errors:\n${bad.join('\n')}`).toEqual([]);
  };
}

