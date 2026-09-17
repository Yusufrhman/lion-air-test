import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { foldersApi } from "@/features/folders/api/folders-api"
import type { FolderDetail, FolderNode } from "@/shared/types/api"

export const folderKeys = {
  all: ["folders"] as const,
  tree: ["folders", "tree"] as const,
  detail: (id: number) => ["folders", "detail", id] as const,
}

export function useFolderTree() {
  return useQuery({
    queryKey: folderKeys.tree,
    queryFn: foldersApi.tree,
  })
}

export function useFolderDetail(id: MaybeRefOrGetter<number | null>) {
  return useQuery({
    queryKey: computed(() => folderKeys.detail(toValue(id) ?? 0)),
    queryFn: () => foldersApi.detail(toValue(id) as number),
    enabled: computed(() => toValue(id) !== null),
  })
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: folderKeys.all })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId: number | null }) =>
      foldersApi.create(name, parentId),
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: { name?: string; parentId?: number | null }
    }) => foldersApi.update(id, payload),
    onSuccess: (updated: FolderNode | { id: number; name: string; parentId: number | null }) => {
      invalidateAll(queryClient)
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(updated.id) })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => foldersApi.remove(id),
    onSuccess: (_message: string, id: number) => {
      invalidateAll(queryClient)
      queryClient.removeQueries({ queryKey: folderKeys.detail(id) })
    },
  })
}

export type { FolderDetail }
