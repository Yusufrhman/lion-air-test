<script setup lang="ts">
import AppButton from "./base-button.vue"
import AppIcon from "./app-icon.vue"

defineProps<{
  loading: boolean
  error: unknown
}>()

const emit = defineEmits<{ retry: [] }>()

function messageOf(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  return String(error)
}
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center gap-3 px-6 py-14">
    <div class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">
      <AppIcon name="spin" :size="14" class="animate-spin" />
      Fetching records…
    </div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center gap-3 px-6 py-12 text-center">
    <div class="flex size-12 rotate-2 items-center justify-center border border-ink-900 bg-rust-100 text-rust-700">
      <AppIcon name="alert" :size="22" />
    </div>
    <p class="font-mono text-xs text-ink-600">{{ messageOf(error) }}</p>
    <AppButton variant="outline" size="sm" icon="check" @click="emit('retry')">Try again</AppButton>
  </div>

  <slot v-else />
</template>
