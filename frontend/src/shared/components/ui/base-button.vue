<script setup lang="ts">
import AppIcon, { type IconName } from "./app-icon.vue"

type Variant = "primary" | "outline" | "ghost" | "danger" | "brass"
type Size = "sm" | "md"

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    icon?: IconName
    loading?: boolean
    block?: boolean
  }>(),
  { variant: "primary", size: "md", loading: false, block: false },
)

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-paper border border-ink-900 shadow-plate hover:bg-ink-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  brass:
    "bg-brass-400 text-ink-950 border border-ink-900 shadow-plate hover:bg-brass-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  outline:
    "bg-transparent text-ink-800 border border-ink-300 hover:border-ink-900 hover:bg-ink-50",
  ghost:
    "bg-transparent text-ink-500 border border-transparent hover:bg-ink-100 hover:text-ink-900",
  danger:
    "bg-rust-600 text-paper border border-ink-900 shadow-plate hover:bg-rust-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
}

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-[11px]",
  md: "px-4 py-2 text-xs",
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-[0.14em] transition-all disabled:pointer-events-none disabled:opacity-40"
    :class="[variants[props.variant], sizes[props.size], props.block ? 'w-full' : '']"
    :disabled="props.loading"
  >
    <AppIcon v-if="props.loading" name="spin" :size="14" class="animate-spin" />
    <AppIcon v-else-if="props.icon" :name="props.icon" :size="14" />
    <span v-if="$slots.default" class="whitespace-nowrap"><slot /></span>
  </button>
</template>
