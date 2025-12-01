import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the app header with logo and search', async ({ page }) => {
    // Check for app header elements
    await expect(page.getByRole('banner')).toBeVisible()
    // The app is called "Couch Critics"
    await expect(page.getByRole('link', { name: /couch critics/i })).toBeVisible()
    // Header has a search form with placeholder
    await expect(page.getByPlaceholder('Search TV shows...')).toBeVisible()
  })

  test('should display Popular section', async ({ page }) => {
    // Wait for the Popular section to load (heading is just "Popular")
    await expect(page.getByRole('heading', { name: /^popular$/i })).toBeVisible({ timeout: 15000 })

    // Wait for show cards to load - they have "View Details" buttons
    await expect(page.getByRole('button', { name: /view details/i }).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test('should display New Releases section', async ({ page }) => {
    // Wait for the New Releases section to load
    await expect(page.getByRole('heading', { name: /new releases/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test('should display genre buttons', async ({ page }) => {
    // Wait for "Browse by Genre" section
    await expect(page.getByRole('heading', { name: /browse by genre/i })).toBeVisible({
      timeout: 15000,
    })

    // Wait for at least one genre button to be visible
    await expect(
      page.getByRole('button', { name: /drama|comedy|action|crime|animation/i }).first(),
    ).toBeVisible({ timeout: 15000 })
  })

  test('should navigate to search page when clicking a genre', async ({ page }) => {
    // Wait for genres to load
    await expect(page.getByRole('heading', { name: /browse by genre/i })).toBeVisible({
      timeout: 15000,
    })

    // Click any genre button
    const genreButton = page.getByRole('button', { name: /drama|comedy|action|crime/i }).first()
    await genreButton.waitFor({ state: 'visible', timeout: 15000 })
    await genreButton.click()

    // Should navigate to search page with genre query param
    await expect(page).toHaveURL(/\/search\?genre=/)
  })

  test('should navigate to show details when clicking View Details', async ({ page }) => {
    // Wait for shows to load - they have "View Details" buttons
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 15000 })
    await viewDetailsBtn.click()

    // Should navigate to show details page
    await expect(page).toHaveURL(/\/show\/\d+/)
  })

  test('should navigate to search page via Explore Shows button', async ({ page }) => {
    // The hero section has an "Explore Shows" button
    await page.getByRole('button', { name: /explore shows/i }).click()
    await expect(page).toHaveURL('/search')
  })

  test('should search from header', async ({ page }) => {
    // Use the header search
    const searchInput = page.getByPlaceholder('Search TV shows...')
    await searchInput.fill('Breaking')
    // The header search button (in the banner)
    await page
      .getByRole('banner')
      .getByRole('button', { name: /search/i })
      .click()

    // Should navigate to search page with query
    await expect(page).toHaveURL(/\/search\?q=Breaking/)
  })
})
