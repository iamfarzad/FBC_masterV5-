import { test } from '../fixtures/chat.fixture';

test.describe('Chat Functionality', () => {
  test('should navigate to chat and verify initial state', async ({ chatPage, page }) => {
    await expect(chatPage).toBeDefined();
    await expect(page).toHaveURL(/chat/);
  });

  test('should be able to send and receive messages', async ({ chatPage }) => {
    const testMessage = 'Hello, this is a test message';
    await chatPage.sendMessage(testMessage);
    await chatPage.verifyMessageSent(testMessage);
  });

  test('should be able to start and stop voice AI', async ({ chatPage }) => {
    await chatPage.startVoiceAI();
    // Verify voice AI is active
    await expect(chatPage.page.getByText('Voice AI Natural conversation')).toBeVisible();
  });

  test('should be able to start and stop video call', async ({ chatPage }) => {
    await chatPage.startVideoCall();
    // Verify video call is active
    await expect(chatPage.page.getByText('Video Call Connected')).toBeVisible();
  });

  test('should be able to start and stop screen share', async ({ chatPage }) => {
    await chatPage.startScreenShare();
    // Verify screen share is active
    await expect(chatPage.page.getByText('Screen Share Sharing')).toBeVisible();
  });

  test('should show correct stage progress', async ({ chatPage }) => {
    await chatPage.verifyStageProgress(3, 7, 49);
  });

  test('should handle theme switching', async ({ chatPage, page }) => {
    await chatPage.openSettings();
    
    // Switch to light theme
    await page.getByRole('radio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Switch to dark theme
    await page.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:3000/chat');
    
    // Check main navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check form elements
    const input = page.getByRole('textbox', { name: 'Business inquiry input' });
    await expect(input).toBeVisible();
    
    const sendButton = page.getByRole('button', { name: 'Send message' });
    await expect(sendButton).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be usable on mobile devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/chat');
    
    // Check if mobile menu is accessible
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    
    // Check if chat input is accessible
    const input = page.getByRole('textbox', { name: 'Business inquiry input' });
    await expect(input).toBeVisible();
  });
});
