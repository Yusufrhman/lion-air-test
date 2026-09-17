<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { FolderNode } from "@/shared/types/api"
import AppModal from "@/shared/components/ui/app-modal.vue"
import BaseInput from "@/shared/components/ui/base-input.vue"
import BaseSelect from "@/shared/components/ui/base-select.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"

const props = withDefaults(
  defineProps<{
    /** Folder being renamed, if any */
    folder: FolderNode | null
    /** Parent for a new folder, null = root */
    parentId: number | null
    /** Flat list of every folder for the parent selector */
    flatFolders: { value: number; label: string }[]
    busy?: boolean
    error?: string | null
  }>(),
  { busy: false, error: null },
)

const emit = defineEmits<{
  submit: [payload: { name: string; parentId: number | null }]
  close: []
}>()

const open = defineModel<boolean>({ default: false })
const name = ref("")
const parentId = ref<number | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.folder) {
    name.value = props.folder.name
    parentId.value = props.folder.parentId
  } else {
    name.value = ""
    parentId.value = props.parentId
  }
})

const trimmed = computed(() => name.value.trim())
const localError = computed(() => {
  if (trimmed.value.length === 0) return "Name is required."
  return null
})

function submit() {
  if (localError.value) return
  emit("submit", { name: trimmed.value, parentId: parentId.value })
}
</script>

<template>
  <AppModal
    v-model="open"
    :title="props.folder ? 'Rename folder' : 'New folder'"
    :subtitle="
      props.folder
        ? `Record #${props.folder.id}`
        : props.parentId
          ? `Inside folder #${props.parentId}`
          : 'At the root of the cabinet'
    "
    width="max-w-md"
    @update:model-value="(v: boolean) => !v && emit('close')"
  >
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="name"
        label="Folder name"
        placeholder="e.g. HR Policies"
        required
        :error="props.error ?? localError"
      />
      <BaseSelect
        v-model="parentId"
        label="Parent folder"
        placeholder="Root — no parent"
        :options="props.flatFolders"
      />
      <div class="flex justify-end gap-2 pt-1">
        <BaseButton variant="outline" size="sm" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" size="sm" :loading="props.busy">
          {{ props.folder ? "Save changes" : "Create" }}
        </BaseButton>
      </div>
    </form>
  </AppModal>
</template>
