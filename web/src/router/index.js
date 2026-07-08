import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import firstYear from '@/views/firstYear.vue'
import secondYear from '@/views/secondYear.vue'
import thirdYear from '@/views/thirdYear.vue'
import forthYear from '@/views/forthYear.vue'
import Optional from '@/views/Optional.vue'

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

    {
      path: '/secondYear',
      component: secondYear
    },

    {
      path: '/thirdYear',
      component: thirdYear
    },

    {
      path: '/forthYear', 
      component: forthYear
    },

    {
      path: '/Optional',
      component: Optional
    },
    //Dashboards
    {
      path: '/dashboard/:code',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')

    }

  ],
})

export default router
