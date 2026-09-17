<script setup lang="ts">
import { computed, ref, watch } from "vue"
import FileMetaFields from "@/features/files/components/file-meta-fields.vue"
import { validateUploadFile } from "@/features/files/lib/file-validation"
import AppModal from "@/shared/components/ui/app-modal.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"
import { formatBytes } from "@/shared/lib/format"

const props = withDefaults(
  defineProps<{
    busy?: boolean
    error?: string | null
  }>(),
  { busy: false, error: null },
)

const emit = defineEmits<{
  submit: [payload: {
    title: string
    departmentId: number
    folderId: number
    file: globalThis.File
  }]
  close: []
}>()

const open = defineModel<boolean>({ default: false })

const title = ref("")
const departmentId = ref<number | null>(null)
const folderId = ref<number | null>(null)
const file = ref<globalThis.File | null>(null)

watch(open, (isOpen) => {
  if (isOpen) {
    title.value = ""
    departmentId.value = null
    folderId.value = null
    file.value = null
  }
})

const fileError = computed(() => validateUploadFile(file.value))

const fieldErrors = computed(() => ({
  title: title.value.trim() === "" ? "Title is required." : null,
  departmentId: departmentId.value === null ? "Pick a department." : null,
  folderId: folderId.value === null ? "Pick a destination folder." : null,
  file: fileError.value,
}))

const anyError = computed(() => Object.values(fieldErrors.value).some(Boolean))

function submit() {
  if (anyError.value || !file.value || departmentId.value === null || folderId.value === null) return
  emit("submit", {
    title: title.value.trim(),
    departmentId: departmentId.value,
    folderId: folderId.value,
    file: file.value,
  })
}
</script>

<template>
  <AppModal
    v-model="open"
    title="Upload document"
    subtitle="New physical record"
    width="max-w-lg"
    @update:model-value="(v: boolean) => !v && emit('close')"
  >
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <FileMetaFields
        v-model:title="title"
        v-model:department-id="departmentId"
        v-model:folder-id="folderId"
        v-model:file="file"
        show-file-input
        :errors="fieldErrors"
      />

      <p
        v-if="file"
        class="flex items-center justify-between border border-dashed border-ink-300 bg-brass-50 px-3 py-2 font-mono text-[11px] text-ink-600"
      >
        <span class="truncate">Selected: {{ file.name }}</span>
        <span>{{ formatBytes(file.size) }}</span>
      </p>

      <p v-if="props.error" class="font-mono text-[11px] font-medium text-rust-600">{{ props.error }}</p>

      <div class="flex justify-end gap-2 pt-1">
        <BaseButton variant="outline" size="sm" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" variant="brass" size="sm" icon="upload" :loading="props.busy">
          Upload
        </BaseButton>
      </div>
    </form>
  </AppModal>
</template>
