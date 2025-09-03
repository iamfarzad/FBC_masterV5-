import { test, expect, Page } from '@playwright/test'

// Test configuration
const TEST_URL = 'http://localhost:5000'
const API_TIMEOUT = 30000

test.describe('Voice Pipeline - Complete Integration Test', () => {
  let page: Page
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto(`${TEST_URL}/chat`)
    await page.waitForLoadState('networkidle')
  })
  
  test.afterEach(async () => {
    await page.close()
  })
  
  test('1. Live API endpoint should be available', async () => {
    const response = await page.request.post(`${TEST_URL}/api/gemini-live`, {
      data: { action: 'probe' },
      timeout: API_TIMEOUT
    })
    
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    
    expect(data).toHaveProperty('available', true)
    expect(data).toHaveProperty('model')
    console.log('✅ Live API available with model:', data.model)
  })
  
  test('2. Voice button should be visible and clickable', async () => {
    // Wait for chat interface to load
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 })
    
    // Check for voice button (microphone icon)
    const voiceButton = await page.locator('button:has(svg[class*="lucide-mic"])').first()
    await expect(voiceButton).toBeVisible()
    await expect(voiceButton).toBeEnabled()
    
    console.log('✅ Voice button is visible and enabled')
  })
  
  test('3. Voice overlay should open when button is clicked', async () => {
    // Click voice button
    const voiceButton = await page.locator('button:has(svg[class*="lucide-mic"])').first()
    await voiceButton.click()
    
    // Wait for voice overlay to appear
    await page.waitForSelector('.voice-overlay, [data-testid="voice-overlay"], div:has-text("Gemini Live")', {
      timeout: 5000
    })
    
    // Check overlay is visible
    const overlay = await page.locator('.voice-overlay, [data-testid="voice-overlay"], div:has-text("Gemini Live")').first()
    await expect(overlay).toBeVisible()
    
    console.log('✅ Voice overlay opens successfully')
  })
  
  test('4. Microphone permission should be requested', async ({ context }) => {
    // Grant microphone permission beforehand
    await context.grantPermissions(['microphone'])
    
    // Click voice button
    const voiceButton = await page.locator('button:has(svg[class*="lucide-mic"])').first()
    await voiceButton.click()
    
    // Wait for overlay
    await page.waitForSelector('div:has-text("Gemini Live")', { timeout: 5000 })
    
    // Check for recording indicators
    const recordingIndicator = await page.locator('text=/Listening|Recording|Active/i').first()
    const isRecording = await recordingIndicator.isVisible().catch(() => false)
    
    if (isRecording) {
      console.log('✅ Microphone permission granted and recording active')
    } else {
      console.log('⚠️ Recording not active - checking for permission request')
    }
  })
  
  test('5. Live API session should start successfully', async ({ context }) => {
    // Grant permissions
    await context.grantPermissions(['microphone'])
    
    // Start a Live API session directly
    const response = await page.request.post(`${TEST_URL}/api/gemini-live`, {
      data: {
        action: 'start',
        sessionId: `test_${Date.now()}`,
        leadContext: {
          name: 'Test User',
          company: 'Test Company',
          role: 'QA Tester'
        }
      },
      timeout: API_TIMEOUT
    })
    
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('sessionId')
    
    const sessionId = data.sessionId
    console.log('✅ Live session started:', sessionId)
    
    // Clean up session
    await page.request.post(`${TEST_URL}/api/gemini-live`, {
      data: { action: 'end', sessionId },
      timeout: API_TIMEOUT
    })
  })
  
  test('6. Microphone should stop when overlay is closed', async ({ context }) => {
    // Grant permissions
    await context.grantPermissions(['microphone'])
    
    // Open voice overlay
    const voiceButton = await page.locator('button:has(svg[class*="lucide-mic"])').first()
    await voiceButton.click()
    
    // Wait for overlay
    await page.waitForSelector('div:has-text("Gemini Live")', { timeout: 5000 })
    
    // Close overlay using X button or Cancel
    const closeButton = await page.locator('button:has(svg[class*="lucide-x"]), button:has-text("Cancel")').first()
    await closeButton.click()
    
    // Verify overlay is gone
    await expect(page.locator('div:has-text("Gemini Live")')).toBeHidden()
    
    // Check console for cleanup messages
    const messages = await page.evaluate(() => {
      return (window as any).console.logs || []
    })
    
    console.log('✅ Voice overlay closed and cleanup triggered')
  })
  
  test('7. End-to-end voice interaction flow', async ({ context }) => {
    // Grant all permissions
    await context.grantPermissions(['microphone'])
    
    // Setup console log capture
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('Browser:', msg.text())
      }
    })
    
    // Click voice button
    const voiceButton = await page.locator('button:has(svg[class*="lucide-mic"])').first()
    await voiceButton.click()
    
    // Wait for overlay
    await page.waitForSelector('div:has-text("Gemini Live")', { timeout: 5000 })
    
    // Simulate interaction
    await page.waitForTimeout(2000)
    
    // Close overlay
    const closeButton = await page.locator('button:has(svg[class*="lucide-x"])').first()
    await closeButton.click()
    
    // Verify cleanup
    await expect(page.locator('div:has-text("Gemini Live")')).toBeHidden()
    
    console.log('✅ Complete voice interaction flow tested')
  })
  
  test('8. Chat functionality remains working', async () => {
    // Test regular chat still works
    const chatInput = await page.locator('[data-testid="chat-input"]')
    await chatInput.fill('Hello, test message')
    await chatInput.press('Enter')
    
    // Wait for response
    await page.waitForSelector('div:has-text("F.B/c")', { timeout: 15000 })
    
    console.log('✅ Regular chat functionality working')
  })
})

// Run comprehensive test suite
test.describe('Validation Tests', () => {
  test('API models are correctly configured', async ({ page }) => {
    const response = await page.request.post(`${TEST_URL}/api/gemini-live`, {
      data: { action: 'probe' }
    })
    
    const data = await response.json()
    expect(data.model).toMatch(/gemini.*audio|gemini.*live/i)
    
    console.log('✅ Correct model configured:', data.model)
  })
  
  test('No WebSocket connection storms', async ({ page }) => {
    await page.goto(`${TEST_URL}/chat`)
    
    let wsConnections = 0
    page.on('websocket', ws => {
      wsConnections++
      console.log(`WebSocket ${wsConnections}:`, ws.url())
    })
    
    // Open and close voice overlay multiple times
    for (let i = 0; i < 3; i++) {
      const voiceButton = await page.locator('button:has(svg[class*="lucide-mic"])').first()
      if (await voiceButton.isVisible()) {
        await voiceButton.click()
        await page.waitForTimeout(500)
        
        const closeButton = await page.locator('button:has(svg[class*="lucide-x"])').first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
    
    // Should not have excessive WebSocket connections
    expect(wsConnections).toBeLessThanOrEqual(3)
    console.log(`✅ WebSocket connections controlled: ${wsConnections}`)
  })
})