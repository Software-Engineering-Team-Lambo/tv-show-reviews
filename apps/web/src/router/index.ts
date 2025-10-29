import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SearchView from '@/views/SearchView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ShowDetailsView from '@/views/ShowDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/profile/:id?',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/show/:id',
      name: 'show-details',
      component: ShowDetailsView,
    },
  ],
})

export default router
