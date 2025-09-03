import { test, expect } from '@playwright/test'

test.describe('FBC Platform - Complete E2E Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000')
    await page.waitForLoadState('networkidle')
  })

  test('Navigation and routing', async ({ page }) => {
    // Test navigation bar
    await expect(page.locator('header')).toBeVisible()
    
    // Check all navigation links
    const navLinks = [
      { label: 'Home', path: '/' },
      { label: 'Platform', path: '/chat' },
      { label: 'Workshop', path: '/workshop' },
      { label: 'Consulting', path: '/consulting' },
      { label: 'Contact', path: '/contact' }
    ]

    for (const link of navLinks) {
      const navItem = page.locator(`nav a:has-text("${link.label}")`)
      await expect(navItem).toBeVisible()
      await navItem.click()
      await expect(page).toHaveURL(new RegExp(link.path))
      await page.waitForLoadState('networkidle')
    }
  })

  test('Homepage functionality', async ({ page }) => {
    await page.goto('http://localhost:5000')
    
    // Check hero section
    await expect(page.locator('h1')).toBeVisible()
    
    // Check CTA buttons
    const ctaButton = page.locator('button:has-text("Get Started")')
    if (await ctaButton.isVisible()) {
      await ctaButton.click()
      await expect(page).toHaveURL(/chat/)
    }
  })

  test('Chat platform - Core functionality', async ({ page }) => {
    await page.goto('http://localhost:5000/chat')
    await page.waitForLoadState('networkidle')
    
    // Check consent overlay if visible
    const consentDialog = page.locator('[role="dialog"]')
    if (await consentDialog.isVisible()) {
      const acceptButton = page.locator('button:has-text("Accept")')
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }
    }
    
    // Check chat interface elements
    await expect(page.locator('[data-testid="chat-container"], main')).toBeVisible()
    
    // Test message input
    const inputField = page.locator('textarea[placeholder*="Message"], input[placeholder*="Message"]')
    await expect(inputField).toBeVisible()
    await inputField.fill('Hello, can you help me with AI automation?')
    
    // Send message
    const sendButton = page.locator('button[aria-label*="Send"], button:has(svg[class*="Send"])')
    await sendButton.click()
    
    // Wait for AI response
    await page.waitForSelector('.message-assistant, [data-role="assistant"]', { 
      timeout: 30000,
      state: 'visible' 
    })
  })

  test('Sidebar tools navigation', async ({ page }) => {
    await page.goto('http://localhost:5000/chat')
    await page.waitForLoadState('networkidle')
    
    // Test sidebar buttons
    const toolButtons = [
      { icon: 'Camera', label: 'Webcam' },
      { icon: 'Monitor', label: 'Screen' },
      { icon: 'FileText', label: 'Document' }
    ]
    
    for (const tool of toolButtons) {
      const toolButton = page.locator(`button[aria-label*="${tool.label}"], button:has(svg[class*="${tool.icon}"])`)
      if (await toolButton.isVisible()) {
        await toolButton.click()
        await page.waitForTimeout(500)
        
        // Check if tool panel opened
        const toolPanel = page.locator(`[data-tool="${tool.label.toLowerCase()}"], .tool-panel`)
        if (await toolPanel.isVisible()) {
          // Close tool
          const closeButton = page.locator('button[aria-label="Close"], button:has(svg[class*="X"])')
          if (await closeButton.isVisible()) {
            await closeButton.click()
          }
        }
      }
    }
  })

  test('Upload functionality', async ({ page }) => {
    await page.goto('http://localhost:5000/chat')
    await page.waitForLoadState('networkidle')
    
    // Find upload button (paperclip icon)
    const uploadButton = page.locator('button:has(svg[class*="Paperclip"]), button[aria-label*="Upload"]')
    await expect(uploadButton).toBeVisible()
    
    // Click should trigger file input
    await uploadButton.click()
    
    // Note: Can't actually test file upload in automated test without mocking
  })

  test('Theme toggle', async ({ page }) => {
    await page.goto('http://localhost:5000')
    
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has(svg[class*="Sun"]), button:has(svg[class*="Moon"])')
    await expect(themeToggle).toBeVisible()
    
    // Get initial theme
    const htmlElement = page.locator('html')
    const initialTheme = await htmlElement.getAttribute('data-theme') || await htmlElement.getAttribute('class')
    
    // Toggle theme
    await themeToggle.click()
    await page.waitForTimeout(500)
    
    // Check theme changed
    const newTheme = await htmlElement.getAttribute('data-theme') || await htmlElement.getAttribute('class')
    expect(newTheme).not.toBe(initialTheme)
  })

  test('Workshop page', async ({ page }) => {
    await page.goto('http://localhost:5000/workshop')
    await page.waitForLoadState('networkidle')
    
    // Check workshop header
    await expect(page.locator('h1:has-text("Workshop"), h2:has-text("Workshop")')).toBeVisible()
    
    // Check for module cards
    const moduleCards = page.locator('.module-card, [data-module]')
    const count = await moduleCards.count()
    expect(count).toBeGreaterThan(0)
    
    // Test module interaction
    if (count > 0) {
      await moduleCards.first().click()
      await page.waitForTimeout(1000)
    }
  })

  test('Contact form', async ({ page }) => {
    await page.goto('http://localhost:5000/contact')
    await page.waitForLoadState('networkidle')
    
    // Check form elements
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]')
    const emailInput = page.locator('input[name="email"], input[type="email"]')
    const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="Message"]')
    
    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(messageInput).toBeVisible()
    
    // Fill form
    await nameInput.fill('Test User')
    await emailInput.fill('test@example.com')
    await messageInput.fill('This is a test message')
    
    // Find submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Send")')
    await expect(submitButton).toBeVisible()
  })

  test('Responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5000')
    
    // Check mobile menu
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has(svg[class*="Menu"])')
    await expect(mobileMenuButton).toBeVisible()
    
    await mobileMenuButton.click()
    await page.waitForTimeout(500)
    
    // Check mobile menu opened
    const mobileNav = page.locator('[role="dialog"], .mobile-menu, aside')
    await expect(mobileNav).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    
    // Desktop nav should be visible
    const desktopNav = page.locator('header nav')
    await expect(desktopNav).toBeVisible()
  })

  test('Stage Rail indicator', async ({ page }) => {
    await page.goto('http://localhost:5000/chat')
    await page.waitForLoadState('networkidle')
    
    // Check if Stage Rail is visible (after session starts)
    const stageRail = page.locator('[data-testid="stage-indicator"], .stage-rail')
    
    // Send a message to start session
    const inputField = page.locator('textarea[placeholder*="Message"], input[placeholder*="Message"]')
    await inputField.fill('Start session')
    const sendButton = page.locator('button[aria-label*="Send"], button:has(svg[class*="Send"])')
    await sendButton.click()
    
    // Wait a bit for session to initialize
    await page.waitForTimeout(2000)
    
    // Check stage indicator
    if (await stageRail.isVisible()) {
      await expect(stageRail).toContainText(/Stage \d/)
    }
  })

  test('Voice input button', async ({ page }) => {
    await page.goto('http://localhost:5000/chat')
    await page.waitForLoadState('networkidle')
    
    // Find voice button
    const voiceButton = page.locator('button[aria-label*="Voice"], button:has(svg[class*="Mic"])')
    await expect(voiceButton).toBeVisible()
    
    // Click voice button
    await voiceButton.click()
    await page.waitForTimeout(500)
    
    // Check voice overlay
    const voiceOverlay = page.locator('[data-voice-overlay], .voice-overlay')
    if (await voiceOverlay.isVisible()) {
      // Close overlay
      const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label="Cancel"]')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
      }
    }
  })

  test('Performance and polish', async ({ page }) => {
    await page.goto('http://localhost:5000')
    
    // Check for smooth animations
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]')
    const animatedCount = await animatedElements.count()
    expect(animatedCount).toBeGreaterThan(0)
    
    // Check for glass morphism effects
    const glassElements = page.locator('[class*="glass"], [class*="backdrop-blur"]')
    const glassCount = await glassElements.count()
    expect(glassCount).toBeGreaterThan(0)
    
    // Check for gradient elements
    const gradientElements = page.locator('[class*="gradient"]')
    const gradientCount = await gradientElements.count()
    expect(gradientCount).toBeGreaterThan(0)
  })

  test('Error handling', async ({ page }) => {
    // Test 404 page
    await page.goto('http://localhost:5000/non-existent-page')
    await page.waitForLoadState('networkidle')
    
    // Should show 404 or redirect to home
    const notFoundText = page.locator('text=/404|not found/i')
    const homeRedirect = page.url() === 'http://localhost:5000/'
    
    expect(await notFoundText.isVisible() || homeRedirect).toBeTruthy()
  })
})

test.describe('Accessibility', () => {
  test('Keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:5000')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    
    // Check focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }
    
    // Press Enter on focused element
    await page.keyboard.press('Enter')
  })

  test('ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5000/chat')
    
    // Check for ARIA labels on buttons
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')
      const hasText = await button.textContent()
      
      // Button should have aria-label, title, or visible text
      expect(ariaLabel || title || hasText).toBeTruthy()
    }
  })
})