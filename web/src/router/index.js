import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import firstYear from '@/views/firstYear.vue'
import secondYear from '@/views/secondYear.vue'
import thirdYear from '@/views/thirdYear.vue'
import forthYear from '@/views/forthYear.vue'
import Optional from '@/views/Optional.vue'
import FightMode from '@/views/FightMode.vue'

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

    {
      path: '/fight-mode',
      component: FightMode
    },

    //Dashboards
    {
      path: '/dashboard/:code',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')

    },

    {
      path: '/dashboardYear/:course',
      name: 'dashboardYear',
      component: () => import('@/views/DashboardYear.vue')

    },

    {
      path: '/dashboardGeneralOpts',
      name: 'dashboardGeneralOpts',
      component: () => import('@/views/DashboardGeneralOpts.vue')

    }
  ],
})

export default router
