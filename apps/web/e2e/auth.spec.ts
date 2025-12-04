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

// Helper to fill and submit signup form
async function signupUser(page: Page, user: { username: string; email: string; password: string }) {
  await page.goto('/login')

  // Switch to signup tab
  await page.getByRole('button', { name: 'Sign Up' }).click()

  // Fill in signup form
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Email').fill(user.email)
  await page.locator('#signup-password input').fill(user.password)
  await page.locator('#signup-confirm-password input').fill(user.password)

  // Submit form
  await page.getByRole('button', { name: 'Create Account' }).click()
}

test.describe('Auth - Login Page', () => {
  test('should display login form by default', async ({ page }) => {
    await page.goto('/login')

    // Check for login form elements
    await expect(page.getByLabel('Email or Username')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.locator('form').getByRole('button', { name: 'Login' })).toBeVisible()

    // Check for signup tab button
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible()
  })

  test('should switch to signup form when clicking Sign Up tab', async ({ page }) => {
    await page.goto('/login')

    // Click signup tab
    await page.getByRole('button', { name: 'Sign Up' }).click()

    // Check for signup form elements
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.locator('#signup-password')).toBeVisible()
    await expect(page.locator('#signup-confirm-password')).toBeVisible()
  })

  test('should show Couch Critics branding', async ({ page }) => {
    await page.goto('/login')

    // Check for branding
    await expect(page.getByText('Couch')).toBeVisible()
    await expect(page.getByText('Critics')).toBeVisible()
    await expect(page.getByText('Your TV Show Review Community')).toBeVisible()
  })

  test('should have link back to home page', async ({ page }) => {
    await page.goto('/login')

    // Click logo to go home
    await page.locator('a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Auth - Login Validation', () => {
  test('should show validation error for empty email/username', async ({ page }) => {
    await page.goto('/login')

    // Try to submit with empty fields
    await page.locator('form').getByRole('button', { name: 'Login' }).click()

    // Should show validation error
    await expect(page.getByText('Please enter your email or username')).toBeVisible()
  })

  test('should show validation error for empty password', async ({ page }) => {
    await page.goto('/login')

    // Fill email but not password
    await page.getByLabel('Email or Username').fill('test@example.com')
    await page.locator('form').getByRole('button', { name: 'Login' }).click()

    // Should show validation error
    await expect(page.getByText('Please enter your password')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill with invalid credentials
    await page.getByLabel('Email or Username').fill('nonexistent@example.com')
    await page.locator('#login-password input').fill('wrongpassword')
    await page.locator('form').getByRole('button', { name: 'Login' }).click()

    // Should show error message (from API)
    await expect(page.getByText(/invalid|incorrect|failed|not found/i)).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Auth - Signup Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign Up' }).click()
  })

  test('should show validation error for short username', async ({ page }) => {
    // Fill with short username
    await page.getByLabel('Username').fill('abc')
    await page.getByLabel('Email').fill('test@example.com')
    await page.locator('#signup-password input').fill('Password123!')
    await page.locator('#signup-confirm-password input').fill('Password123!')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show validation error
    await expect(page.getByText(/username must be at least 4 characters/i)).toBeVisible()
  })

  test('should show validation error for invalid username characters', async ({ page }) => {
    // Fill with invalid characters
    await page.getByLabel('Username').fill('test@user')
    await page.getByLabel('Email').fill('test@example.com')
    await page.locator('#signup-password input').fill('Password123!')
    await page.locator('#signup-confirm-password input').fill('Password123!')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show validation error
    await expect(page.getByText(/letters, numbers, and underscores only/i)).toBeVisible()
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser')
    await page.getByLabel('Email').fill('notanemail')
    await page.locator('#signup-password input').fill('Password123!')
    await page.locator('#signup-confirm-password input').fill('Password123!')

    // disable browser input validation
    await page.$eval('form', (form) => (form.noValidate = true))
    await page.getByRole('button', { name: 'Create Account' }).click({ force: true })

    // Should show validation error
    await expect(page.locator('.text-red-500')).toBeVisible()
    await expect(page.locator('.text-red-500')).toContainText(/email/i)
  })

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser')
    await page.getByLabel('Email').fill('test@example.com')
    await page.locator('#signup-password input').fill('short')
    await page.locator('#signup-confirm-password input').fill('short')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show validation error
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()
  })

  test('should show validation error for mismatched passwords', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser')
    await page.getByLabel('Email').fill('test@example.com')
    await page.locator('#signup-password input').fill('Password123!')
    await page.locator('#signup-confirm-password input').fill('DifferentPassword!')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show validation error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })
})

test.describe('Auth - Signup Flow', () => {
  test('should successfully sign up a new user', async ({ page }) => {
    const testUser = generateTestUser()
    await signupUser(page, testUser)

    // Should redirect to home page after successful signup
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Verify user is actually logged in by checking username appears in header
    await expect(page.getByRole('button', { name: testUser.username })).toBeVisible({
      timeout: 10000,
    })
  })

  test('should show error when email already exists', async ({ page }) => {
    const testUser = generateTestUser()

    // First signup
    await signupUser(page, testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Logout (navigate back to login)
    await page.goto('/login')

    // Try to signup with same email
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Username').fill(`other${testUser.username}`)
    await page.getByLabel('Email').fill(testUser.email)
    await page.locator('#signup-password input').fill(testUser.password)
    await page.locator('#signup-confirm-password input').fill(testUser.password)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show error about email existing
    await expect(page.getByText('Account with this email already exists')).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Auth - Login Flow', () => {
  test('should successfully login with email', async ({ page }) => {
    const testUser = generateTestUser()

    // First create the user
    await signupUser(page, testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Logout by going to login page (this effectively clears the session for test)
    await page.context().clearCookies()
    await page.goto('/login')

    // Login with email
    await page.getByLabel('Email or Username').fill(testUser.email)
    await page.locator('#login-password input').fill(testUser.password)
    await page.locator('form').getByRole('button', { name: 'Login' }).click()

    // Should redirect to home page
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Verify user is actually logged in by checking username appears in header
    await expect(page.getByRole('button', { name: testUser.username })).toBeVisible({
      timeout: 10000,
    })
  })

  test('should successfully login with username', async ({ page }) => {
    const testUser = generateTestUser()

    // First create the user
    await signupUser(page, testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Logout
    await page.context().clearCookies()
    await page.goto('/login')

    // Login with username
    await page.getByLabel('Email or Username').fill(testUser.username)
    await page.locator('#login-password input').fill(testUser.password)
    await page.locator('form').getByRole('button', { name: 'Login' }).click()

    // Should redirect to home page
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Verify user is actually logged in by checking username appears in header
    await expect(page.getByRole('button', { name: testUser.username })).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Auth - Session Persistence', () => {
  test('should maintain session after page reload', async ({ page }) => {
    const testUser = generateTestUser()

    // Create and login user
    await signupUser(page, testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Reload page
    await page.reload()

    // User should still be logged in - check for user menu or profile link
    // The header should show something different for logged in users
    await expect(page.getByRole('button', { name: testUser.username })).toBeVisible({
      timeout: 10000,
    })
  })

  test('should be able to access profile when logged in', async ({ page }) => {
    const testUser = generateTestUser()

    // Create and login user
    await signupUser(page, testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Navigate to profile
    await page.goto('/profile')

    // Should be able to access profile page
    await expect(page).toHaveURL('/profile')
    await expect(page.getByText(testUser.username)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Auth - Logout', () => {
  test('should logout successfully', async ({ page }) => {
    const testUser = generateTestUser()

    // Create and login user
    await signupUser(page, testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Look for and click logout button (may be in a menu)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    } else {
      // May need to open a menu first
      const userMenu = page.getByRole('button', { name: new RegExp(testUser.username, 'i') })
      if (await userMenu.isVisible()) {
        await userMenu.click()
        await page.getByRole('menuitem', { name: /logout|sign out/i }).click()
      }
    }

    // Wait a bit for logout to complete
    await page.waitForTimeout(1000)

    // Try to access profile - should redirect to login
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})

test.describe('Auth - Protected Routes', () => {
  test('should redirect to login when accessing profile without auth', async ({ page }) => {
    // Clear cookies to ensure logged out
    await page.context().clearCookies()

    // Try to access profile
    await page.goto('/profile')

    // Should redirect to login or show login prompt
    await expect(page.getByText(/log in|please log in/i)).toBeVisible({ timeout: 10000 })
  })
})
