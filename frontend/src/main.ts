import { createApp } from "vue"
import { createPinia } from "pinia"
import { VueQueryPlugin } from "@tanstack/vue-query"
import App from "./App.vue"
import "./style.css"
import router from "./app/router"
import { setUnauthorizedHandler } from "./shared/api/client"
import { useSessionStore } from "./features/auth/composables/use-session"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount: number, error: unknown) => {
          const status = (error as { status?: number })?.status
          if (status && status >= 400 && status < 500) return false
          return failureCount < 2
        },
      },
    },
  },
})

setUnauthorizedHandler(() => {
  const session = useSessionStore(pinia)
  if (!session.isAuthenticated) return
  session.invalidate()
  void router.replace({ name: "login" })
})

app.mount("#app")
