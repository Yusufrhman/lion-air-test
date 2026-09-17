<script setup lang="ts">
import AppModal from "./app-modal.vue"
import BaseButton from "./base-button.vue"
import AppIcon from "./app-icon.vue"

const props = withDefaults(
  defineProps<{
    title?: string
    message: string
    confirmLabel?: string
    tone?: "danger" | "neutral"
    busy?: boolean
  }>(),
  { title: "Please confirm", confirmLabel: "Confirm", tone: "danger", busy: false },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <AppModal v-model="open" :title="props.title" width="max-w-sm">
    <div class="flex gap-3">
      <div
        class="flex size-9 shrink-0 items-center justify-center border border-ink-900"
        :class="props.tone === 'danger' ? 'bg-rust-100 text-rust-700' : 'bg-brass-100 text-brass-700'"
      >
        <AppIcon name="alert" :size="18" />
      </div>
      <p class="text-sm leading-relaxed text-ink-700">{{ props.message }}</p>
    </div>
    <div class="mt-5 flex justify-end gap-2">
      <BaseButton variant="outline" size="sm" :disabled="props.busy" @click="emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton
        :variant="props.tone === 'danger' ? 'danger' : 'primary'"
        size="sm"
        :loading="props.busy"
        @click="emit('confirm')"
      >
        {{ props.confirmLabel }}
      </BaseButton>
    </div>
  </AppModal>
</template>
