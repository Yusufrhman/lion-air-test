import { api, toApiError } from "@/shared/api/client"
import type { User } from "@/shared/types/api"

export interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  data: { accessToken: string; user: User }
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse["data"]> {
    try {
      const { data } = await api.post<LoginResponse>("/login", payload)
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ data: User }>("/me")
    return data.data
  },

  async logout(): Promise<void> {
    await api.post("/logout")
  },
}
