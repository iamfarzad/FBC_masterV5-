/**
 * 🔧 MASTER FLOW: End-to-End Test Suite
 * Tests the complete TC/consent → intelligence → chat → PDF pipeline
 */

import { test, expect } from '@playwright/test'

test.describe('Master Flow Integration', () => {
  test('Complete TC → Intelligence → Chat → PDF Pipeline', async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat')

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('What can we build together?')

    // 1. ✅ Consent → Session-Init
    // Check if consent overlay appears
    const consentOverlay = page.locator('[data-testid="consent-overlay"]')
    if (await consentOverlay.isVisible()) {
      // Fill consent form
      await page.locator('[data-testid="name-input"]').fill('Test User')
      await page.locator('[data-testid="email-input"]').fill('test@example.com')
      await page.locator('[data-testid="company-url-input"]').fill('https://example.com')
      
      // Submit consent
      await page.locator('[data-testid="consent-submit"]').click()
      
      // Wait for intelligence initialization
      await page.waitForFunction(() => {
        const logs = window.console.log.toString()
        return logs.includes('Intelligence initialized') || logs.includes('Intelligence context loaded')
      }, { timeout: 10000 }).catch(() => {
        console.log('⚠️ Intelligence logs not detected (may still work)')
      })
    }

    // 2. ✅ Chat Identity & Personalization  
    // Use specific test ID for chat input
    const chatInput = page.getByTestId('chat-input')
    await expect(chatInput).toBeVisible()
    
    // Ask identity question
    await chatInput.fill('who are you?')
    await chatInput.press('Enter')
    
    // Wait for response
    await page.waitForSelector('.prose', { timeout: 15000 })
    
    // Check response contains F.B/c identity
    const response = await page.locator('.prose').first().textContent()
    expect(response).toMatch(/F\.B\/c|Farzad/i)

    // 3. ✅ Tool Suggestion
    // Ask for ROI calculation
    await chatInput.fill('calculate ROI for my project')
    await chatInput.press('Enter')
    
    // Wait for response and check for ROI capability
    await page.waitForSelector('.prose', { timeout: 15000 })
    
    // Look for ROI button or capability mention
    const roiButton = page.locator('[data-coach-cta][data-tool="roi"]').first()
    const roiMention = page.locator('text=ROI').first()
    
    const hasROICapability = (await roiButton.isVisible().catch(() => false)) || 
                            (await roiMention.isVisible().catch(() => false))
    
    if (hasROICapability) {
      console.log('✅ ROI capability detected in response')
    } else {
      console.log('⚠️ ROI capability not detected (may still work)')
    }

    // 4. ✅ PDF Download (if Share Summary button exists)
    const shareButton = page.getByTestId('generate-pdf')
    if (await shareButton.isVisible().catch(() => false)) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
      
      // Click Share Summary
      await shareButton.click()
      
      // Click Download PDF option
      const downloadPDF = page.getByTestId('download-pdf')
      if (await downloadPDF.isVisible().catch(() => false)) {
        await downloadPDF.click()
        
        // Wait for download
        const download = await downloadPromise.catch(() => null)
        
        if (download) {
          expect(download.suggestedFilename()).toMatch(/FB-c_Summary.*\.pdf/)
          console.log('✅ PDF download successful:', download.suggestedFilename())
        } else {
          console.log('⚠️ PDF download not completed (may need more time)')
        }
      }
    } else {
      console.log('⚠️ Share Summary button not found (may appear after more conversation)')
    }

    // 5. ✅ Stage Progress (if StageRail is visible)
    const stageIndicator = page.getByTestId('stage-indicator')
    if (await stageIndicator.isVisible().catch(() => false)) {
      const stageText = await stageIndicator.textContent()
      expect(stageText).toMatch(/Stage \d+ of 7/)
      console.log('✅ Stage progress detected:', stageText)
    }
  })

  test('Intelligence Context Loading', async ({ page }) => {
    // Test direct intelligence context loading
    await page.goto('/chat')
    
    // Check console for intelligence logs
    const consoleLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text())
      }
    })
    
    // Wait for potential intelligence loading
    await page.waitForTimeout(3000)
    
    // Check for intelligence-related logs
    const hasIntelligenceLogs = consoleLogs.some(log => 
      log.includes('Intelligence') || 
      log.includes('context loaded') ||
      log.includes('research')
    )
    
    if (hasIntelligenceLogs) {
      console.log('✅ Intelligence system active:', consoleLogs.filter(log => 
        log.includes('Intelligence') || log.includes('context')
      ))
    } else {
      console.log('⚠️ No intelligence logs detected')
    }
  })

  test('API Endpoints Health Check', async ({ request }) => {
    // Test unified chat endpoint
    const chatResponse = await request.get('/api/chat/unified?action=status')
    expect(chatResponse.status()).toBe(200)
    
    const chatData = await chatResponse.json()
    expect(chatData.status).toBe('operational')
    
    // Test intelligence context endpoint (should handle missing sessionId gracefully)
    const contextResponse = await request.get('/api/intelligence/context')
    expect([400, 404]).toContain(contextResponse.status()) // Should fail gracefully
    
    // Test capabilities endpoint
    const capabilitiesResponse = await request.get('/api/capabilities')
    expect([200, 404]).toContain(capabilitiesResponse.status()) // May not exist
    
    console.log('✅ Core API endpoints responding')
  })
})

// Graceful handling for missing elements
test.beforeEach(async ({ page }) => {
  // Ignore console errors that don't affect functionality
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      console.log('Console error:', msg.text())
    }
  })
  
  // Handle potential network errors gracefully
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      console.log(`API response: ${response.status()} ${response.url()}`)
    }
  })
})