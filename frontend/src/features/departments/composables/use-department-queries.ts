import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { departmentsApi } from "@/features/departments/api/departments-api"

export const departmentKeys = {
  all: ["departments"] as const,
}

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: departmentsApi.list,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: departmentKeys.all }),
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => departmentsApi.update(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: departmentKeys.all }),
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => departmentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: departmentKeys.all }),
  })
}
