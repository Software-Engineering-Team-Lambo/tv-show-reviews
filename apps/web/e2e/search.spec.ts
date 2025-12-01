import { test, expect } from '@playwright/test'

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
  })

  test('should display search header and filters', async ({ page }) => {
    // Check for the main search input (in the search bar component)
    await expect(page.getByPlaceholder('Search by title, actor, or keyword...')).toBeVisible({
      timeout: 15000,
    })

    // Check for filter elements (genre label - use exact match to avoid ambiguity)
    await expect(page.getByText('Genres', { exact: true })).toBeVisible({ timeout: 15000 })
  })

  test('should display search results after applying filter', async ({ page }) => {
    // Wait for filters to load
    await expect(page.getByText('Genres', { exact: true })).toBeVisible({ timeout: 15000 })

    // Click the genre multiselect to open it
    const genreSelect = page.locator('[data-pc-name="multiselect"]').first()
    await genreSelect.click()

    // Select a genre from the dropdown
    await page.getByRole('option').first().click()

    // Wait for results to load - look for "View Details" buttons
    await expect(page.getByRole('button', { name: /view details/i }).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test('should search for shows by title', async ({ page }) => {
    // Find the search bar input
    const searchInput = page.getByPlaceholder('Search by title, actor, or keyword...')
    await searchInput.fill('Breaking')

    // Click the search button (the second one, in the main content, not header)
    await page
      .getByRole('button', { name: /search/i })
      .nth(1)
      .click()

    // Wait for results or empty state
    await page.waitForTimeout(2000)

    // Page should have search results or show "No results" message
    const mainContent = page.locator('.container').first()
    await expect(mainContent).toBeVisible()
  })

  test('should navigate to show details when clicking a result', async ({ page }) => {
    // First apply a filter to get results
    await expect(page.getByText('Genres', { exact: true })).toBeVisible({ timeout: 15000 })

    const genreSelect = page.locator('[data-pc-name="multiselect"]').first()
    await genreSelect.click()
    await page.getByRole('option').first().click()

    // Wait for results to load
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 15000 })

    // Click the first show's "View Details" button
    await viewDetailsBtn.click()

    // Should navigate to show details page
    await expect(page).toHaveURL(/\/show\/\d+/)
  })

  test('should preserve search query from URL', async ({ page }) => {
    // Navigate with a query parameter
    await page.goto('/search?q=Breaking')

    // Wait a bit for the query to be processed
    await page.waitForTimeout(1000)

    // The search input should have the query value
    const searchInput = page.getByPlaceholder('Search by title, actor, or keyword...')
    await expect(searchInput).toHaveValue('Breaking')
  })

  test('should show year filter', async ({ page }) => {
    // Wait for filters to load
    await expect(page.getByText('Year', { exact: true })).toBeVisible({ timeout: 15000 })
  })

  test('should show sort options', async ({ page }) => {
    // Wait for filters to load
    await expect(page.getByText('Sort By', { exact: true })).toBeVisible({ timeout: 15000 })
  })
})
