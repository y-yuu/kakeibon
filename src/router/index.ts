import { createRouter, createWebHistory } from 'vue-router'
import ResultSheet from '@/views/ResultSheet.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "ResultSheet",
      component: () => {
        return ResultSheet
      }
    },
    {
      path: "/detailRegister",
      name: "DetailRegister",
      component: () => {
        return import("@/views/DetailRegister.vue");
      }
    }
  ]
})

export default router
