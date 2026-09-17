import { defineStore } from "pinia"
import { authApi } from "@/features/auth/api/auth-api"
import { api, clearSession, getStoredToken, setStoredToken } from "@/shared/api/client"
import type { User } from "@/shared/types/api"
import { toApiError } from "@/shared/api/client"

interface SessionState {
  user: User | null
  status: "idle" | "booting" | "ready"
}

export const useSessionStore = defineStore("session", {
  state: (): SessionState => ({
    user: null,
    status: "idle",
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isAdmin: (state) => state.user?.role === "administrator",
  },

  actions: {
    async boot() {
      if (this.status !== "idle") return
      this.status = "booting"
      const token = getStoredToken()
      if (!token) {
        this.status = "ready"
        return
      }
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      try {
        this.user = await authApi.me()
      } catch {
        clearSession()
      } finally {
        this.status = "ready"
      }
    },

    async login(email: string, password: string) {
      const { accessToken, user } = await authApi.login({ email, password })
      setStoredToken(accessToken)
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      this.user = user
    },

    async logout() {
      try {
        await authApi.logout()
      } catch (error) {
        // Token may already be revoked; ignore and clear locally regardless.
        void toApiError(error)
      }
      clearSession()
      this.user = null
    },

    invalidate() {
      clearSession()
      this.user = null
    },
  },
})
