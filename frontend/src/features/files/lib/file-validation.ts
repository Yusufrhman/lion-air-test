import { fileExtension } from "@/shared/lib/format"

export const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"] as const

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const FILE_TYPE_ERROR =
  "The file field must be a file of type: pdf, doc, docx, xls, xlsx, png, jpg, jpeg."

export const FILE_SIZE_ERROR = `The file field must not be greater than ${MAX_FILE_SIZE_MB} MB.`

export function isAllowedFileType(fileName: string): boolean {
  return (ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(fileExtension(fileName))
}

export function isWithinMaxSize(file: globalThis.File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES
}

export function validateUploadFile(file: globalThis.File | null): string | null {
  if (file === null) return "Attach a file to upload."
  if (!isAllowedFileType(file.name)) return FILE_TYPE_ERROR
  if (!isWithinMaxSize(file)) return FILE_SIZE_ERROR
  return null
}
