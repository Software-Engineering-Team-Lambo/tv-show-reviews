import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  // Check if user is logged in (called on app mount)
  async function checkAuth() {
    loading.value = true
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Important: send cookies
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data.user
      } else {
        user.value = null
      }
    } catch (error) {
      console.error('Failed to check auth:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(emailOrUsername: string, password: string) {
    const response = await fetch('/api/loginSignup/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername, password }),
      credentials: 'include', // Important: receive cookies
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Login failed')
    }

    const data = await response.json()
    user.value = data.user
    return data
  }

  async function signup(username: string, email: string, password: string) {
    const response = await fetch('/api/loginSignup/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
      credentials: 'include', // Important: receive cookies
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Signup failed')
    }

    const data = await response.json()
    Object.assign(user.data, data.user)
    return data
  }

  async function logout() {
    try {
      await fetch('/api/loginSignup/logout', {
        method: 'POST',
        credentials: 'include', // Important: send cookies
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      user.value = null
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    checkAuth,
    login,
    signup,
    logout,
  }
})
