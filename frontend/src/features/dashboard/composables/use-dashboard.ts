import { useQuery } from "@tanstack/vue-query"
import { dashboardApi } from "@/features/dashboard/api/dashboard-api"
import { fileKeys } from "@/features/files/composables/use-file-queries"
import { folderKeys } from "@/features/folders/composables/use-folder-queries"
import { departmentKeys } from "@/features/departments/composables/use-department-queries"

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"] as const,
    queryFn: dashboardApi.get,
  })
}

export const dashboardKeys = {
  all: ["dashboard"] as const,
  staleRefs: [fileKeys.all, folderKeys.all, departmentKeys.all],
}
