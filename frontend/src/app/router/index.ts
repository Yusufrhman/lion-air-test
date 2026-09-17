import { createRouter, createWebHistory } from "vue-router"
import { useSessionStore } from "@/features/auth/composables/use-session"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/features/auth/pages/login-page.vue"),
      meta: { publicOnly: true },
    },
    {
      path: "/",
      component: () => import("@/shared/components/layout/app-shell.vue"),
      children: [
        {
          path: "",
          redirect: { name: "dashboard" },
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/features/dashboard/pages/dashboard-page.vue"),
          meta: { requiresAdmin: true, section: "dashboard" },
        },
        {
          path: "folders",
          name: "folders",
          component: () => import("@/features/folders/pages/folders-page.vue"),
          meta: { section: "folders" },
        },
        {
          path: "files",
          name: "files",
          component: () => import("@/features/files/pages/files-page.vue"),
          meta: { section: "files" },
        },
        {
          path: "departments",
          name: "departments",
          component: () => import("@/features/departments/pages/departments-page.vue"),
          meta: { section: "departments" },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "files" },
    },
  ],
})

router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.boot()

  if (!session.isAuthenticated && to.name !== "login") {
    return { name: "login", query: { redirect: to.fullPath } }
  }

  if (to.name === "login" && session.isAuthenticated) {
    return { name: session.isAdmin ? "dashboard" : "files" }
  }

  if (to.meta.requiresAdmin && !session.isAdmin) {
    return { name: "files" }
  }

  return true
})

export default router
