/**
 * Homepage E2E Tests
 * Tests for the complete homepage user journey
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/Farzad Bayat - AI Consultant/)

    // Check main heading
    await expect(page.locator('h1')).toContainText('Build AI That Actually Works')
  })

  test('has working navigation', async ({ page }) => {
    await page.goto('/')

    // Check if navigation links exist
    const chatLink = page.locator('a').filter({ hasText: 'Talk with F.B/c AI' })
    await expect(chatLink).toBeVisible()

    // Navigate to chat page
    await chatLink.click()
    await expect(page).toHaveURL(/.*chat/)
  })

  test('displays features section', async ({ page }) => {
    await page.goto('/')

    // Check features section
    await expect(page.locator('h2').filter({ hasText: 'AI Solutions That Drive Results' })).toBeVisible()

    // Check feature cards
    await expect(page.locator('h3').filter({ hasText: 'AI Strategy & Implementation' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Intelligent Chatbots' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Workflow Automation' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Rapid Prototyping' })).toBeVisible()
  })

  test('has working CTA buttons', async ({ page }) => {
    await page.goto('/')

    // Check main CTA button
    const mainCTA = page.locator('button').filter({ hasText: 'Start Your AI Project' })
    await expect(mainCTA).toBeVisible()

    // Check secondary CTA
    const chatCTA = page.locator('a').filter({ hasText: 'Talk with F.B/c AI' })
    await expect(chatCTA).toBeVisible()

    // Check about link
    const aboutLink = page.locator('a').filter({ hasText: 'Learn My Story' })
    await expect(aboutLink).toBeVisible()
  })

  test('displays testimonials', async ({ page }) => {
    await page.goto('/')

    // Check testimonials section
    await expect(page.locator('h2').filter({ hasText: 'What Clients Say' })).toBeVisible()

    // Check if testimonials are present
    await expect(page.locator('p').filter({ hasText: 'Farzad\'s AI automation saved us' })).toBeVisible()
  })

  test('has working footer links', async ({ page }) => {
    await page.goto('/')

    // Check footer links
    const consultingLink = page.locator('a').filter({ hasText: 'Learn More' }).first()
    await expect(consultingLink).toBeVisible()

    // Navigate to consulting page
    await consultingLink.click()
    await expect(page).toHaveURL(/.*consulting/)
  })
})

test.describe('Homepage - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('is mobile responsive', async ({ page }) => {
    await page.goto('/')

    // Check that content fits on mobile
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()

    // Check mobile navigation
    const mobileMenu = page.locator('[data-mobile-menu]')
    // This would depend on your mobile menu implementation
  })
})
