<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { Department } from "@/shared/types/api"
import AppModal from "@/shared/components/ui/app-modal.vue"
import BaseInput from "@/shared/components/ui/base-input.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"

const props = defineProps<{
  department: Department | null
  busy?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  submit: [name: string]
  close: []
}>()

const open = defineModel<boolean>({ default: false })
const name = ref("")

watch(open, (isOpen) => {
  if (isOpen) name.value = props.department?.name ?? ""
})

const trimmed = computed(() => name.value.trim())
const localError = computed(() => {
  if (trimmed.value.length === 0) return "Name is required."
  if (trimmed.value.length > 255) return "Name is too long."
  return null
})

function submit() {
  if (localError.value) return
  emit("submit", trimmed.value)
}
</script>

<template>
  <AppModal
    v-model="open"
    :title="props.department ? 'Edit department' : 'New department'"
    :subtitle="props.department ? `Record #${props.department.id}` : 'Create a filing section'"
    width="max-w-md"
    @update:model-value="(v: boolean) => !v && emit('close')"
  >
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="name"
        label="Department name"
        placeholder="e.g. Finance"
        required
        :error="props.error ?? localError"
        :hint="props.department ? `updated ${props.department.updatedAt.slice(0, 10)}` : undefined"
      />
      <p v-if="props.error" class="font-mono text-[11px] font-medium text-rust-600">
        {{ props.error }}
      </p>
      <div class="flex justify-end gap-2 pt-1">
        <BaseButton variant="outline" size="sm" @click="emit('close')">Cancel</BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          size="sm"
          :loading="props.busy"
        >
          {{ props.department ? "Save changes" : "Create" }}
        </BaseButton>
      </div>
    </form>
  </AppModal>
</template>
