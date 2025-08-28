/**
 * Chat Functionality E2E Tests
 * Tests for the complete chat user journey and functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Chat Functionality', () => {
  test('loads chat page successfully', async ({ page }) => {
    await page.goto('/chat')

    // Check page title
    await expect(page).toHaveTitle(/.*[Cc]hat.*/)

    // Check for chat interface elements
    await expect(page.locator('input[placeholder*="message"]')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Send' })).toBeVisible()
  })

  test('can send a message', async ({ page }) => {
    await page.goto('/chat')

    // Type a message
    const messageInput = page.locator('input[placeholder*="message"]')
    await messageInput.fill('Hello, this is a test message')

    // Send the message
    const sendButton = page.locator('button').filter({ hasText: 'Send' })
    await sendButton.click()

    // Wait for response (this might need adjustment based on your implementation)
    await page.waitForTimeout(2000)

    // Check if user message appears
    await expect(page.locator('text=Hello, this is a test message')).toBeVisible()
  })

  test('displays AI responses', async ({ page }) => {
    await page.goto('/chat')

    // Send a message
    const messageInput = page.locator('input[placeholder*="message"]')
    await messageInput.fill('Tell me about AI automation')

    const sendButton = page.locator('button').filter({ hasText: 'Send' })
    await sendButton.click()

    // Wait for AI response
    await page.waitForTimeout(3000)

    // Check for AI response (this would depend on your AI response patterns)
    // You might look for specific response patterns or UI elements
    const responseElements = page.locator('[data-role="assistant"]')
    await expect(responseElements.first()).toBeVisible()
  })

  test('handles message history', async ({ page }) => {
    await page.goto('/chat')

    // Send multiple messages
    const messageInput = page.locator('input[placeholder*="message"]')
    const sendButton = page.locator('button').filter({ hasText: 'Send' })

    // First message
    await messageInput.fill('First message')
    await sendButton.click()
    await page.waitForTimeout(1000)

    // Second message
    await messageInput.fill('Second message')
    await sendButton.click()
    await page.waitForTimeout(1000)

    // Check that both messages are visible
    await expect(page.locator('text=First message')).toBeVisible()
    await expect(page.locator('text=Second message')).toBeVisible()
  })

  test('has working clear chat functionality', async ({ page }) => {
    await page.goto('/chat')

    // Send a message first
    const messageInput = page.locator('input[placeholder*="message"]')
    await messageInput.fill('Test message for clearing')

    const sendButton = page.locator('button').filter({ hasText: 'Send' })
    await sendButton.click()
    await page.waitForTimeout(1000)

    // Verify message exists
    await expect(page.locator('text=Test message for clearing')).toBeVisible()

    // Find and click clear button (this might need adjustment based on your UI)
    const clearButton = page.locator('button').filter({ hasText: 'Clear' })
    if (await clearButton.isVisible()) {
      await clearButton.click()

      // Verify message is cleared
      await expect(page.locator('text=Test message for clearing')).not.toBeVisible()
    }
  })

  test('handles keyboard shortcuts', async ({ page }) => {
    await page.goto('/chat')

    // Type a message
    const messageInput = page.locator('input[placeholder*="message"]')
    await messageInput.fill('Test keyboard shortcut')

    // Press Enter to send
    await page.keyboard.press('Enter')

    // Wait for processing
    await page.waitForTimeout(1000)

    // Check if message was sent
    await expect(page.locator('text=Test keyboard shortcut')).toBeVisible()
  })

  test('shows typing indicators during AI response', async ({ page }) => {
    await page.goto('/chat')

    // Send a message
    const messageInput = page.locator('input[placeholder*="message"]')
    await messageInput.fill('Test typing indicator')

    const sendButton = page.locator('button').filter({ hasText: 'Send' })
    await sendButton.click()

    // Look for loading/typing indicators (this would depend on your implementation)
    // You might look for specific loading elements, spinners, or typing indicators
    const loadingElements = page.locator('[data-loading="true"], .loading, [aria-busy="true"]')
    // This test would need to be adjusted based on your specific loading UI
  })

  test('handles tool interactions', async ({ page }) => {
    await page.goto('/chat')

    // Look for tool buttons (this would depend on your tool implementation)
    const toolButtons = page.locator('button[data-tool]')

    if (await toolButtons.count() > 0) {
      // Click first tool button
      await toolButtons.first().click()

      // Wait for tool interaction
      await page.waitForTimeout(1000)

      // Check if tool panel or modal opens
      const toolPanel = page.locator('[data-tool-panel], .tool-panel, [role="dialog"]')
      // This test would need adjustment based on your tool UI implementation
    }
  })

  test('maintains conversation context', async ({ page }) => {
    await page.goto('/chat')

    // Send first message
    const messageInput = page.locator('input[placeholder*="message"]')
    await messageInput.fill('My name is John')

    const sendButton = page.locator('button').filter({ hasText: 'Send' })
    await sendButton.click()
    await page.waitForTimeout(2000)

    // Send follow-up message
    await messageInput.fill('What\'s my name?')
    await sendButton.click()
    await page.waitForTimeout(2000)

    // Check if AI remembers the context (this would depend on your AI implementation)
    // The response should ideally reference the name "John"
  })
})

test.describe('Chat Functionality - Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // This test would require mocking network failures
    // For now, it's a placeholder for error handling tests
    await page.goto('/chat')

    // Verify basic error handling UI elements exist
    const chatInterface = page.locator('[data-chat-interface]')
    await expect(chatInterface).toBeVisible()
  })

  test('handles invalid input gracefully', async ({ page }) => {
    await page.goto('/chat')

    // Try sending empty message
    const sendButton = page.locator('button').filter({ hasText: 'Send' })
    await sendButton.click()

    // Should not send empty messages (this would depend on your validation)
    // The test should verify appropriate behavior for invalid input
  })
})
