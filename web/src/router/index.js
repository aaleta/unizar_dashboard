import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import firstYear from '@/views/firstYear.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView
    },

    {
      path: '/firstYear',
      component: firstYear
    },
  ],
})

export default router
