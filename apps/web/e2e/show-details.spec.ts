import { test, expect } from '@playwright/test'

test.describe('Show Details Page', () => {
  test('should display show details', async ({ page }) => {
    // First go to home to get a valid show
    await page.goto('/')

    // Wait for shows to load and click the first "View Details" button
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Wait for show details to load
    await expect(page).toHaveURL(/\/show\/\d+/)

    // Should display show title (in a Card header)
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 15000 })
  })

  test('should display show poster/image', async ({ page }) => {
    // Navigate from home to a show
    await page.goto('/')
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Wait for image to load
    await expect(page.locator('img').first()).toBeVisible({ timeout: 15000 })
  })

  test('should display show description', async ({ page }) => {
    await page.goto('/')
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Wait for content to load - page should have meaningful content
    await page.waitForTimeout(2000)

    const pageContent = await page.locator('body').textContent()
    // Should have substantive content (description, genres, etc.)
    expect(pageContent?.length).toBeGreaterThan(100)
  })

  test('should display reviews section', async ({ page }) => {
    await page.goto('/')
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Look for reviews section - either "User Reviews" or "Write Your Review"
    await expect(page.getByText(/user reviews|write your review/i).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test('should display stats section', async ({ page }) => {
    await page.goto('/')
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Look for Stats section
    await expect(page.getByText('Stats').first()).toBeVisible({ timeout: 15000 })
  })

  test('should have back navigation option', async ({ page }) => {
    // Start from home
    await page.goto('/')

    // Navigate to a show
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 15000 })
    await viewDetailsBtn.click()

    // Wait for show page to load
    await expect(page).toHaveURL(/\/show\/\d+/)

    // Go back using browser navigation
    await page.goBack()

    // Should be back on home page
    await expect(page).toHaveURL('/')
  })

  test('should handle invalid show ID gracefully', async ({ page }) => {
    await page.goto('/show/999999999')

    // Wait for error state
    await page.waitForTimeout(3000)

    // Should show error message
    await expect(page.getByText(/error|failed|not found/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('should display genre tags', async ({ page }) => {
    await page.goto('/')
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Wait for content to load
    await page.waitForTimeout(2000)

    // Should display some genre/category info
    const pageContent = await page.locator('body').textContent()
    const hasGenre = /drama|comedy|action|thriller|horror|sci-fi|crime|animation/i.test(
      pageContent || '',
    )
    expect(hasGenre).toBeTruthy()
  })

  test('should display favorite and watchlist buttons', async ({ page }) => {
    await page.goto('/')
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Look for favorite button by aria-label
    await expect(page.getByRole('button', { name: /add to favorites/i })).toBeVisible({
      timeout: 15000,
    })
  })
})
