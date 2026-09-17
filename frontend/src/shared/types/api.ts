export type Role = "administrator" | "viewer"

export interface User {
  id: number
  email: string
  role: Role
}

export interface FolderRef {
  id: number
  name: string
}

export interface FileDTO {
  id: number
  fileName: string
  title: string
  department: { id: number; name: string }
  folder: { id: number; name: string }
  uploadedBy: { id: number; email: string }
  uploadedAt: string
}

export interface FolderFileRef {
  id: number
  name: string | null
}

export interface FolderNode {
  id: number
  name: string
  parentId: number | null
  children: FolderNode[]
  files: FolderFileRef[]
}

export interface FolderDetail {
  id: number
  name: string
  parent: FolderRef | null
  children: FolderRef[]
  files: FolderFileRef[]
}

export interface Department {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface FileListMeta {
  currentPage: number
  perPage: number
  total: number
}

export interface DashboardData {
  latestFiles: FileDTO[]
  totalFolders: number
  totalFiles: number
  totalDepartments: number
}
