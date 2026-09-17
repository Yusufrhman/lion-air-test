<script setup lang="ts">
import AppIcon, { type IconName } from "./app-icon.vue"

const props = withDefaults(
  defineProps<{
    icon?: IconName
    title: string
    message?: string
  }>(),
  { icon: "inbox" },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div
      class="mb-4 flex size-14 rotate-[-3deg] items-center justify-center border border-dashed border-ink-300 bg-white text-ink-300"
    >
      <AppIcon :name="props.icon" :size="26" />
    </div>
    <h3 class="font-display text-lg font-semibold text-ink-800">{{ props.title }}</h3>
    <p v-if="props.message || $slots.default" class="mt-1 max-w-sm font-mono text-xs leading-relaxed text-ink-400">
      <slot>{{ props.message }}</slot>
    </p>
  </div>
</template>
