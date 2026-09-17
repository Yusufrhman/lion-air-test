<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useSessionStore } from "@/features/auth/composables/use-session"
import {
  useDeleteFile,
  useDownloadFile,
  useFiles,
  useUpdateFile,
  useUploadFile,
} from "@/features/files/composables/use-file-queries"
import { useDepartments } from "@/features/departments/composables/use-department-queries"
import type { FileListParams } from "@/features/files/api/files-api"
import FileUploadModal from "@/features/files/components/file-upload-modal.vue"
import FileEditModal from "@/features/files/components/file-edit-modal.vue"
import { toApiError } from "@/shared/api/client"
import { useToast } from "@/shared/composables/use-toast"
import { useDebouncedRef } from "@/shared/composables/use-debounced-ref"
import { fileExtension, formatDate, totalPages } from "@/shared/lib/format"
import type { FileDTO } from "@/shared/types/api"
import DataState from "@/shared/components/ui/data-state.vue"
import EmptyState from "@/shared/components/ui/empty-state.vue"
import ConfirmDialog from "@/shared/components/ui/confirm-dialog.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"
import BaseInput from "@/shared/components/ui/base-input.vue"
import BaseSelect from "@/shared/components/ui/base-select.vue"
import PaginationBar from "@/shared/components/ui/pagination-bar.vue"

const toast = useToast()
const session = useSessionStore()
const isAdmin = computed(() => session.isAdmin)

// --- filters ---------------------------------------------------------------
const searchInput = ref("")
const search = useDebouncedRef(searchInput, 400)
const departmentId = ref<number | null>(null)
const perPage = ref(10)
const page = ref(1)

watch([search, departmentId, perPage], () => {
  page.value = 1
})

const listParams = computed<FileListParams>(() => ({
  page: page.value,
  perPage: perPage.value,
  search: search.value,
  departmentId: departmentId.value,
}))

const { data, isPending, error, refetch, isFetching } = useFiles(listParams)

const departmentsQuery = useDepartments()
const departmentOptions = computed(() => [
  { value: 0, label: "All departments" },
  ...(departmentsQuery.data.value ?? []).map((d) => ({ value: d.id, label: d.name })),
])

const files = computed(() => data.value?.files ?? [])
const meta = computed(() => data.value?.meta ?? { currentPage: 1, perPage: 10, total: 0 })
const pages = computed(() => totalPages(meta.value.total, meta.value.perPage))

function onPageChange(next: number) {
  page.value = next
}

// --- mutations -------------------------------------------------------------
const uploadMutation = useUploadFile()
const updateMutation = useUpdateFile()
const deleteMutation = useDeleteFile()
const downloadMutation = useDownloadFile()

const uploadOpen = ref(false)
const uploadError = ref<string | null>(null)

const editOpen = ref(false)
const editing = ref<FileDTO | null>(null)
const editError = ref<string | null>(null)

const confirmOpen = ref(false)
const deleting = ref<FileDTO | null>(null)

watch(uploadOpen, (open) => open && (uploadError.value = null))
watch(editOpen, (open) => open && (editError.value = null))

async function submitUpload(payload: {
  title: string
  departmentId: number
  folderId: number
  file: globalThis.File
}) {
  uploadError.value = null
  try {
    const created = await uploadMutation.mutateAsync(payload)
    toast.success("File uploaded", `“${created.title}” filed under ${created.folder.name}.`)
    uploadOpen.value = false
  } catch (err) {
    uploadError.value = toApiError(err).firstFieldError ?? toApiError(err).message
  }
}

function openEdit(file: FileDTO) {
  editing.value = file
  editOpen.value = true
}

async function submitEdit(payload: { title: string; departmentId: number; folderId: number }) {
  if (!editing.value) return
  editError.value = null
  try {
    const updated = await updateMutation.mutateAsync({ id: editing.value.id, payload })
    toast.success("File updated", `“${updated.title}” re-cataloged.`)
    editOpen.value = false
  } catch (err) {
    editError.value = toApiError(err).firstFieldError ?? toApiError(err).message
  }
}

function openDelete(file: FileDTO) {
  deleting.value = file
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  try {
    const message = await deleteMutation.mutateAsync(deleting.value.id)
    toast.success("File deleted", message)
  } catch (err) {
    toast.error("Cannot delete file", toApiError(err).message)
  } finally {
    confirmOpen.value = false
    deleting.value = null
  }
}

async function download(file: FileDTO) {
  try {
    await downloadMutation.mutateAsync({ id: file.id, fileName: file.fileName })
    toast.success("Download started", file.fileName)
  } catch (err) {
    toast.error("Download failed", toApiError(err).message)
  }
}

const extOf = (file: FileDTO) => fileExtension(file.fileName)
const extColor = (ext: string) =>
  ext === "pdf" ? "bg-rust-600 text-paper" : ext === "xlsx" || ext === "xls" ? "bg-moss-600 text-paper" : "bg-ink-700 text-paper"
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div class="min-w-0">
        <p class="eyebrow mb-1 text-brass-600">Section 03</p>
        <h1 class="font-display text-3xl font-black text-ink-950 sm:text-4xl">File index</h1>
        <p class="mt-2 font-mono text-xs text-ink-500">
          Every document in the cabinet, searchable and filterable.
        </p>
      </div>
      <BaseButton v-if="isAdmin" variant="brass" icon="upload" @click="uploadOpen = true">
        Upload
      </BaseButton>
    </div>

    <!-- Filter bar -->
    <div class="mb-6 grid gap-3 border border-ink-900 bg-white p-4 shadow-plate sm:grid-cols-[1fr_180px_150px]">
      <BaseInput v-model="searchInput" label="Search" placeholder="Search fileName or title…" />
      <BaseSelect
        v-model="departmentId"
        label="Department"
        placeholder="All departments"
        :options="departmentOptions.map((o) => ({ value: o.value, label: o.label }))"
      />
      <BaseSelect
        v-model="perPage"
        label="Per page"
        placeholder="10"
        :options="[10, 25, 50, 100].map((n) => ({ value: n, label: `${n} / page` }))"
      />
    </div>

    <!-- Table -->
    <div class="border border-ink-900 bg-white shadow-plate">
      <div class="flex items-center justify-between border-b border-ink-900 bg-ink-50 px-4 py-2.5">
        <p class="eyebrow text-ink-500">Records</p>
        <p class="font-mono text-[11px] text-ink-400">
          {{ isFetching ? "syncing…" : `${meta.total} total` }}
        </p>
      </div>

      <DataState :loading="isPending" :error="error" @retry="refetch()">
        <EmptyState
          v-if="files.length === 0"
          icon="search"
          title="No files found"
          message="Try a different search term or clear the filters."
        />

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left">
            <thead>
              <tr class="border-b border-ink-100 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                <th class="px-3 py-2.5 font-medium sm:px-4">Doc</th>
                <th class="px-3 py-2.5 font-medium sm:px-4">Filed in</th>
                <th class="hidden px-3 py-2.5 font-medium md:table-cell sm:px-4">Department</th>
                <th class="hidden px-3 py-2.5 font-medium lg:table-cell sm:px-4">Uploaded</th>
                <th class="px-3 py-2.5 text-right font-medium sm:px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="file in files"
                :key="file.id"
                class="group border-b border-ink-100 transition-colors last:border-0 hover:bg-brass-50/60"
              >
                <td class="px-3 py-3 sm:px-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex size-9 shrink-0 items-center justify-center border border-ink-900 font-mono text-[10px] font-semibold uppercase"
                      :class="extColor(extOf(file))"
                    >
                      {{ extOf(file) || "file" }}
                    </span>
                    <div class="max-w-[11rem] min-w-0 sm:max-w-[14rem] lg:max-w-none">
                      <p class="truncate font-display text-sm font-semibold text-ink-900">{{ file.title }}</p>
                      <p class="truncate font-mono text-[10px] text-ink-400">{{ file.fileName }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-3 sm:px-4">
                  <p class="max-w-[10rem] truncate font-mono text-xs text-ink-700">{{ file.folder.name }}</p>
                  <p class="font-mono text-[10px] text-ink-300">folder #{{ file.folder.id }}</p>
                </td>
                <td class="hidden px-3 py-3 lg:table-cell sm:px-4">
                  <span class="stamp text-ink-500">{{ file.department.name }}</span>
                </td>
                <td class="hidden px-3 py-3 lg:table-cell sm:px-4">
                  <p class="font-mono text-[11px] text-ink-600">{{ formatDate(file.uploadedAt) }}</p>
                  <p class="font-mono text-[10px] text-ink-300">by {{ file.uploadedBy.email }}</p>
                </td>
                <td class="px-3 py-3 sm:px-4">
                  <div class="flex justify-end gap-1.5 opacity-60 transition-opacity group-hover:opacity-100 max-sm:opacity-100">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      icon="download"
                      title="Download"
                      :loading="downloadMutation.isPending.value && downloadMutation.variables.value?.id === file.id"
                      @click="download(file)"
                    >
                      <span class="hidden sm:inline">Download</span>
                    </BaseButton>
                    <template v-if="isAdmin">
                      <BaseButton variant="ghost" size="sm" icon="pencil" title="Edit" @click="openEdit(file)">
                        <span class="hidden sm:inline">Edit</span>
                      </BaseButton>
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        icon="trash"
                        title="Delete"
                        class="!text-rust-600"
                        @click="openDelete(file)"
                      >
                        <span class="hidden sm:inline">Delete</span>
                      </BaseButton>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DataState>

      <PaginationBar
        :page="meta.currentPage"
        :per-page="meta.perPage"
        :total="meta.total"
        :total-pages="pages"
        @change="onPageChange"
      />
    </div>

    <FileUploadModal
      v-model="uploadOpen"
      :busy="uploadMutation.isPending.value"
      :error="uploadError"
      @submit="submitUpload"
      @close="uploadOpen = false"
    />

    <FileEditModal
      v-model="editOpen"
      :file="editing"
      :busy="updateMutation.isPending.value"
      :error="editError"
      @submit="submitEdit"
      @close="editOpen = false"
    />

    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete file"
      :message="`Delete “${deleting?.title ?? ''}”? The physical file will be removed permanently.`"
      confirm-label="Delete"
      :busy="deleteMutation.isPending.value"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
