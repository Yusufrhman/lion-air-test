import { api, toApiError } from "@/shared/api/client"
import type { FileDTO, FileListMeta } from "@/shared/types/api"

export interface FileListParams {
  page: number
  perPage: number
  search: string
  departmentId: number | null
}

interface FileListResponse {
  data: FileDTO[]
  meta: FileListMeta
}

interface Wrapped<T> {
  message?: string
  data: T
}

export interface UploadFilePayload {
  title: string
  departmentId: number
  folderId: number
  file: globalThis.File
}

export const filesApi = {
  async list(params: FileListParams): Promise<{ files: FileDTO[]; meta: FileListMeta }> {
    const { data } = await api.get<FileListResponse>("/files", {
      params: {
        page: params.page,
        perPage: params.perPage,
        ...(params.search ? { search: params.search } : {}),
        ...(params.departmentId !== null ? { departmentId: params.departmentId } : {}),
      },
    })
    return { files: data.data, meta: data.meta }
  },

  async upload(payload: UploadFilePayload): Promise<FileDTO> {
    try {
      const form = new FormData()
      form.append("title", payload.title)
      form.append("departmentId", String(payload.departmentId))
      form.append("folderId", String(payload.folderId))
      form.append("file", payload.file)
      const { data } = await api.post<Wrapped<FileDTO>>("/files", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(
    id: number,
    payload: { title?: string; departmentId?: number; folderId?: number },
  ): Promise<FileDTO> {
    try {
      const { data } = await api.patch<Wrapped<FileDTO>>(`/files/${id}`, payload)
      return data.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async remove(id: number): Promise<string> {
    try {
      const { data } = await api.delete<{ message: string }>(`/files/${id}`)
      return data.message
    } catch (error) {
      throw toApiError(error)
    }
  },

  async download(id: number): Promise<{ blob: Blob; fileName: string }> {
    try {
      const response = await api.get<Blob>(`/files/${id}/download`, { responseType: "blob" })
      const disposition = response.headers["content-disposition"] ?? ""
      const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition)
      const fileName = match ? decodeURIComponent(match[1]) : `file-${id}`
      return { blob: response.data, fileName }
    } catch (error) {
      throw toApiError(error)
    }
  },
}
