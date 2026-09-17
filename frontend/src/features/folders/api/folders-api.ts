import { api, toApiError } from "@/shared/api/client"
import type { FolderDetail, FolderNode } from "@/shared/types/api"

interface Wrapped<T> {
  message?: string
  data: T
}

export const foldersApi = {
  async tree(): Promise<FolderNode[]> {
    const { data } = await api.get<{ data: FolderNode[] }>("/folders")
    return data.data
  },

  async detail(id: number): Promise<FolderDetail> {
    try {
      const { data } = await api.get<{ data: FolderDetail }>(`/folders/${id}`)
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async create(name: string, parentId: number | null): Promise<FolderDetail> {
    try {
      const { data } = await api.post<Wrapped<{ id: number; name: string; parentId: number | null }>>(
        "/folders",
        { name, parentId },
      )
      return { ...data.data, parent: null, children: [], files: [] }
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(
    id: number,
    payload: { name?: string; parentId?: number | null },
  ): Promise<{ id: number; name: string; parentId: number | null }> {
    try {
      const { data } = await api.patch<Wrapped<{ id: number; name: string; parentId: number | null }>>(
        `/folders/${id}`,
        payload,
      )
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async remove(id: number): Promise<string> {
    try {
      const { data } = await api.delete<{ message: string }>(`/folders/${id}`)
      return data.message
    } catch (error) {
      throw toApiError(error)
    }
  },
}
