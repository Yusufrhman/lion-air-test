import { api } from "@/shared/api/client"
import type { DashboardData } from "@/shared/types/api"

export const dashboardApi = {
  async get(): Promise<DashboardData> {
    const { data } = await api.get<{ data: DashboardData }>("/dashboard")
    return data.data
  },
}
