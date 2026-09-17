<script setup lang="ts">
import { computed } from "vue"
import { ALLOWED_FILE_EXTENSIONS } from "@/features/files/lib/file-validation"
import { useDepartments } from "@/features/departments/composables/use-department-queries"
import { useFolderTree } from "@/features/folders/composables/use-folder-queries"
import BaseInput from "@/shared/components/ui/base-input.vue"
import BaseSelect from "@/shared/components/ui/base-select.vue"

export interface FileMetaValue {
  title: string
  departmentId: number | null
  folderId: number | null
}

const props = withDefaults(
  defineProps<{
    showFileInput?: boolean
    fileRules?: string
    errors?: {
      title?: string | null
      departmentId?: string | null
      folderId?: string | null
      file?: string | null
    }
  }>(),
  {
    showFileInput: false,
    fileRules: "PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG — up to 10 MB",
    errors: () => ({}),
  },
)

const title = defineModel<string>("title", { default: "" })
const departmentId = defineModel<number | null>("departmentId", { default: null })
const folderId = defineModel<number | null>("folderId", { default: null })
const file = defineModel<globalThis.File | null>("file", { default: null })

const { data: departments } = useDepartments()
const { data: tree } = useFolderTree()

const departmentOptions = computed(() =>
  (departments.value ?? []).map((d) => ({ value: d.id, label: d.name })),
)

const folderOptions = computed(() => {
  const out: { value: number; label: string }[] = []
  const walk = (nodes: import("@/shared/types/api").FolderNode[], path: string) => {
    for (const node of nodes) {
      const label = path ? `${path} / ${node.name}` : node.name
      out.push({ value: node.id, label })
      walk(node.children, label)
    }
  }
  walk(tree.value ?? [], "")
  return out
})

const acceptTypes = computed(() => ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(","))

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}
</script>

<template>
  <div class="space-y-4">
    <BaseInput
      v-model="title"
      label="Document title"
      placeholder="e.g. Company Policy"
      required
      :error="props.errors.title"
    />

    <BaseSelect
      v-model="departmentId"
      label="Department"
      placeholder="Choose a department…"
      :options="departmentOptions"
      :error="props.errors.departmentId"
      required
    />

    <BaseSelect
      v-model="folderId"
      label="Destination folder"
      placeholder="Choose a folder…"
      :options="folderOptions"
      :error="props.errors.folderId"
      required
    />

    <label v-if="props.showFileInput" class="block">
      <span class="eyebrow mb-1.5 flex items-baseline justify-between text-ink-500">
        <span>Physical file<span class="ml-1 text-rust-600">*</span></span>
        <span class="normal-case tracking-normal text-ink-300">{{ props.fileRules }}</span>
      </span>
      <input
        type="file"
        :accept="acceptTypes"
        class="w-full cursor-pointer border border-ink-200 bg-white px-3 py-2 font-mono text-xs text-ink-700 transition-colors focus:border-ink-900 focus:outline-none"
        @change="onFileChange"
      />
      <span v-if="props.errors.file" class="mt-1 block font-mono text-[11px] font-medium text-rust-600">
        {{ props.errors.file }}
      </span>
    </label>
  </div>
</template>

