<script setup lang="ts">
import { ref, watch } from "vue"
import type { FileDTO } from "@/shared/types/api"
import FileMetaFields from "@/features/files/components/file-meta-fields.vue"
import AppModal from "@/shared/components/ui/app-modal.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"

const props = withDefaults(
  defineProps<{
    file: FileDTO | null
    busy?: boolean
    error?: string | null
  }>(),
  { busy: false, error: null },
)

const emit = defineEmits<{
  submit: [payload: { title: string; departmentId: number; folderId: number }]
  close: []
}>()

const open = defineModel<boolean>({ default: false })

const title = ref("")
const departmentId = ref<number | null>(null)
const folderId = ref<number | null>(null)

watch(
  [open, () => props.file],
  ([isOpen, file]) => {
    if (isOpen && file) {
      title.value = file.title
      departmentId.value = file.department.id
      folderId.value = file.folder.id
    }
  },
  { immediate: true },
)

const fieldErrors = ref<Record<string, string | null>>({})

function submit() {
  fieldErrors.value = {
    title: title.value.trim() === "" ? "Title is required." : null,
    departmentId: departmentId.value === null ? "Pick a department." : null,
    folderId: folderId.value === null ? "Pick a destination folder." : null,
  }
  if (Object.values(fieldErrors.value).some(Boolean)) return
  if (departmentId.value === null || folderId.value === null) return
  emit("submit", {
    title: title.value.trim(),
    departmentId: departmentId.value,
    folderId: folderId.value,
  })
}
</script>

<template>
  <AppModal
    v-model="open"
    title="Re-catalog document"
    :subtitle="`Record #${props.file?.id} — ${props.file?.fileName ?? ''}`"
    width="max-w-lg"
    @update:model-value="(v: boolean) => !v && emit('close')"
  >
    <p class="mb-4 border border-dashed border-ink-300 bg-ink-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-500">
      Metadata only — the physical file stays untouched.
    </p>

    <form class="space-y-4" novalidate @submit.prevent="submit">
      <FileMetaFields
        v-model:title="title"
        v-model:department-id="departmentId"
        v-model:folder-id="folderId"
        :errors="{ ...fieldErrors, title: fieldErrors.title ?? props.error }"
      />

      <div class="flex justify-end gap-2 pt-1">
        <BaseButton variant="outline" size="sm" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" size="sm" icon="pencil" :loading="props.busy">
          Save changes
        </BaseButton>
      </div>
    </form>
  </AppModal>
</template>
