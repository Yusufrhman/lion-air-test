import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { filesApi, type FileListParams, type UploadFilePayload } from "@/features/files/api/files-api"
import { departmentKeys } from "@/features/departments/composables/use-department-queries"
import { folderKeys } from "@/features/folders/composables/use-folder-queries"
import type { FileDTO, FileListMeta } from "@/shared/types/api"

export const fileKeys = {
  all: ["files"] as const,
  list: (params: FileListParams) =>
    ["files", "list", params.page, params.perPage, params.search, params.departmentId] as const,
}

export function useFiles(params: MaybeRefOrGetter<FileListParams>) {
  return useQuery({
    queryKey: computed(() => fileKeys.list(toValue(params))),
    queryFn: () => filesApi.list(toValue(params)),
    placeholderData: (previous) => previous,
  })
}

function invalidateEverything(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: fileKeys.all })
  queryClient.invalidateQueries({ queryKey: folderKeys.all })
  queryClient.invalidateQueries({ queryKey: departmentKeys.all })
  queryClient.invalidateQueries({ queryKey: ["dashboard"] })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UploadFilePayload) => filesApi.upload(payload),
    onSuccess: (_file: FileDTO) => invalidateEverything(queryClient),
  })
}

export function useUpdateFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: { title?: string; departmentId?: number; folderId?: number }
    }) => filesApi.update(id, payload),
    onSuccess: () => invalidateEverything(queryClient),
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => filesApi.remove(id),
    onSuccess: () => invalidateEverything(queryClient),
  })
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: ({ id }: { id: number; fileName: string }) => filesApi.download(id),
    onSuccess: ({ blob, fileName }: { blob: Blob; fileName: string }, variables: { id: number; fileName: string }) => {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = fileName || variables.fileName
      anchor.click()
      URL.revokeObjectURL(url)
    },
  })
}

export type { FileListMeta }
