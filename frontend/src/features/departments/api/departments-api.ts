import { api, toApiError } from "@/shared/api/client"
import type { Department } from "@/shared/types/api"

interface Wrapped<T> {
  message?: string
  data: T
}

export const departmentsApi = {
  async list(): Promise<Department[]> {
    const { data } = await api.get<{ data: Department[] }>("/departments")
    return data.data
  },

  async create(name: string): Promise<Department> {
    try {
      const { data } = await api.post<Wrapped<Department>>("/departments", { name })
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(id: number, name: string): Promise<Department> {
    try {
      const { data } = await api.patch<Wrapped<Department>>(`/departments/${id}`, { name })
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async remove(id: number): Promise<string> {
    try {
      const { data } = await api.delete<{ message: string }>(`/departments/${id}`)
      return data.message
    } catch (error) {
      throw toApiError(error)
    }
  },
}
