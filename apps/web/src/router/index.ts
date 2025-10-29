import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/profile/:id?',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/show/:id',
      name: 'show-details',
      component: () => import('../views/ShowDetailsView.vue'),
    },
  ],
})

export default router
