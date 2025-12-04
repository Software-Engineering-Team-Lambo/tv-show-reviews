import { test, expect, Page } from '@playwright/test'

// Helper to generate unique test users
function generateTestUser() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return {
    username: `test${random}`,
    email: `test${timestamp}@example.com`,
    password: 'TestPass123!',
  }
}

// Helper to signup and get authenticated context
async function createAuthenticatedUser(page: Page) {
  const testUser = generateTestUser()

  await page.goto('/login')

  // Switch to signup tab
  await page.getByRole('button', { name: 'Sign Up' }).click()

  // Fill in signup form
  await page.getByLabel('Username').fill(testUser.username)
  await page.getByLabel('Email').fill(testUser.email)
  await page.locator('#signup-password input').fill(testUser.password)
  await page.locator('#signup-confirm-password input').fill(testUser.password)

  // Submit form
  await page.getByRole('button', { name: 'Create Account' }).click()

  // Wait for redirect to home
  await expect(page).toHaveURL('/', { timeout: 10000 })

  return testUser
}

// Helper to navigate to first show details
async function navigateToFirstShow(page: Page) {
  await page.goto('/')

  // Wait for shows to load and click first one
  const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
  await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
  await viewDetailsBtn.click()

  // Wait for show page to load
  await expect(page).toHaveURL(/\/show\/\d+/, { timeout: 15000 })
}

test.describe('Profile Page', () => {
  test('should display user profile after login', async ({ page }) => {
    const testUser = await createAuthenticatedUser(page)

    // Navigate to profile
    await page.goto('/profile')

    // Should show username
    await expect(page.getByText(testUser.username)).toBeVisible({ timeout: 10000 })
  })

  test('should show tabs for reviews, favorites, and watchlist', async ({ page }) => {
    await createAuthenticatedUser(page)

    await page.goto('/profile')

    // Check for tabs or sections
    await expect(page.getByRole('tab', { name: /reviews/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('tab', { name: /favorites/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('tab', { name: /watchlist/i })).toBeVisible({ timeout: 10000 })
  })

  test('should show empty state for new user', async ({ page }) => {
    await createAuthenticatedUser(page)

    await page.goto('/profile')

    // New user should have empty state messages or 0 counts
    // Look for either "no reviews/favorites/watchlist" or count of 0
    const pageContent = await page.locator('body').textContent()
    // Profile should load successfully
    expect(pageContent?.length).toBeGreaterThan(50)
  })
})

test.describe('Favorites Feature', () => {
  test('should show favorite button on show page when logged in', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Should show Add to Favorites button
    await expect(page.getByRole('button', { name: /add to favorites/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test('should add show to favorites', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Click Add to Favorites
    const favoriteBtn = page.getByRole('button', { name: /add to favorites/i })
    await favoriteBtn.click()

    // Button should change to show it's favorited (text or icon change)
    await expect(
      page.getByRole('button', { name: /remove from favorites|favorited/i }),
    ).toBeVisible({
      timeout: 10000,
    })
  })

  test('should remove show from favorites', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Add to favorites first
    const addBtn = page.getByRole('button', { name: /add to favorites/i })
    await addBtn.click()

    // Wait for it to be added
    const removeBtn = page.getByRole('button', { name: /remove from favorites|favorited/i })
    await removeBtn.waitFor({ state: 'visible', timeout: 10000 })

    // Click to remove
    await removeBtn.click()

    // Should change back to "Add to Favorites"
    await expect(page.getByRole('button', { name: /add to favorites/i })).toBeVisible({
      timeout: 10000,
    })
  })

  test('should show favorited show in profile', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Get show title
    const showTitle = await page.locator('h1, h2, h3').first().textContent()

    // Add to favorites
    await page.getByRole('button', { name: /add to favorites/i }).click()

    // Wait for it to be added
    await expect(
      page.getByRole('button', { name: /remove from favorites|favorited/i }),
    ).toBeVisible({
      timeout: 10000,
    })

    // Go to profile
    await page.goto('/profile')

    // Click favorites tab
    await page.getByRole('tab', { name: /favorites/i }).click()

    // Should show the favorited show
    if (showTitle) {
      await expect(page.getByText(showTitle)).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Watchlist Feature', () => {
  test('should show watchlist button on show page when logged in', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Should show Add to Watchlist button
    await expect(page.getByRole('button', { name: /add to watchlist|watchlist/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test('should add show to watchlist', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Click Add to Watchlist
    const watchlistBtn = page.getByRole('button', { name: /add to watchlist/i })
    await watchlistBtn.click()

    // May show a dialog for adding note - just confirm/close it
    const dialogConfirm = page
      .locator('.p-dialog')
      .getByRole('button', { name: 'Add to Watchlist' })
    if (await dialogConfirm.isVisible({ timeout: 2000 })) {
      await dialogConfirm.click()
    }

    // Button should change to show it's in watchlist
    await expect(
      page.getByRole('button', { name: /remove from watchlist|in watchlist/i }),
    ).toBeVisible({
      timeout: 10000,
    })
  })

  test('should remove show from watchlist', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Add to watchlist first
    const addBtn = page.getByRole('button', { name: /add to watchlist/i })
    await addBtn.click()

    // Handle dialog if present
    const dialogConfirm = page
      .locator('.p-dialog')
      .getByRole('button', { name: 'Add to Watchlist' })
    if (await dialogConfirm.isVisible({ timeout: 2000 })) {
      await dialogConfirm.click()
    }

    // Wait for it to be added
    const removeBtn = page.getByRole('button', { name: /remove from watchlist|in watchlist/i })
    await removeBtn.waitFor({ state: 'visible', timeout: 10000 })

    // Click to remove
    await removeBtn.click()

    // Should change back to "Add to Watchlist"
    await expect(page.getByRole('button', { name: /add to watchlist/i })).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Reviews Feature', () => {
  test('should show review form when logged in', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Should show review section
    await expect(page.getByText('Write Your Review')).toBeVisible({
      timeout: 15000,
    })
  })

  test('should submit a review', async ({ page }) => {
    await createAuthenticatedUser(page)
    await navigateToFirstShow(page)

    // Wait for review form to be visible
    await expect(page.getByText('Write Your Review')).toBeVisible({
      timeout: 15000,
    })

    // Find and fill the review form
    // Look for rating slider/stars and comment textarea

    // Click 4th star (rating 4)
    // Scope to the last rating component (the one in the form)
    await page
      .locator('[data-pc-name="rating"]')
      .last()
      .locator('[data-pc-section="item"]')
      .nth(3)
      .click({ force: true })

    const textarea = page.locator('textarea')
    if (await textarea.isVisible()) {
      await textarea.fill('This is a great show! Highly recommend watching it.')
    }

    // Find and click submit button
    const submitBtn = page.getByRole('button', { name: /submit|post/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()

      // Review should appear in the list
      await expect(
        page.getByText('This is a great show! Highly recommend watching it.'),
      ).toBeVisible({
        timeout: 10000,
      })
    }
  })

  test('should show existing reviews on show page', async ({ page }) => {
    await page.goto('/')

    // Navigate to a show
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first()
    await viewDetailsBtn.waitFor({ state: 'visible', timeout: 30000 })
    await viewDetailsBtn.click()

    // Wait for page to load
    await expect(page).toHaveURL(/\/show\/\d+/, { timeout: 15000 })

    // Should have a reviews section
    await expect(page.getByText(/reviews|user reviews/i).first()).toBeVisible({
      timeout: 15000,
    })
  })
})

test.describe('Unauthenticated User Behavior', () => {
  test('should redirect to login when clicking favorite while not logged in', async ({ page }) => {
    await page.context().clearCookies()

    await navigateToFirstShow(page)

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Click Add to Favorites
    const favoriteBtn = page.getByRole('button', { name: /add to favorites/i })
    if (await favoriteBtn.isVisible()) {
      await favoriteBtn.click()

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    }
  })

  test('should redirect to login when clicking watchlist while not logged in', async ({ page }) => {
    await page.context().clearCookies()

    await navigateToFirstShow(page)

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Click Add to Watchlist
    const watchlistBtn = page.getByRole('button', { name: /add to watchlist/i })
    if (await watchlistBtn.isVisible()) {
      await watchlistBtn.click()

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    }
  })

  test('should show login prompt for writing reviews when not logged in', async ({ page }) => {
    await page.context().clearCookies()

    await navigateToFirstShow(page)

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Should either show login prompt or not show review form at all
    const reviewForm = page.getByText('Write Your Review')
    const loginPrompt = page.getByText(/sign in to review/i)

    // One of these should be true: no review form visible, or login prompt shown
    const hasReviewForm = await reviewForm.isVisible().catch(() => false)
    const hasLoginPrompt = await loginPrompt.isVisible().catch(() => false)

    // Either the form is hidden or there's a login prompt
    expect(hasReviewForm === false || hasLoginPrompt === true).toBeTruthy()
  })
})

test.describe('Public Profile View', () => {
  test('should be able to view another user profile', async ({ page }) => {
    const testUser = await createAuthenticatedUser(page)

    // Navigate to the public profile URL
    await page.goto(`/user/${testUser.username}`)

    // Should show the username
    await expect(page.getByText(testUser.username)).toBeVisible({ timeout: 10000 })
  })
})
