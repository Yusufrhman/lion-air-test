<script setup lang="ts">
import AppIcon from "./app-icon.vue"

const props = defineProps<{
  page: number
  perPage: number
  total: number
  totalPages: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

function pagesToShow(): (number | "…")[] {
  const { page, totalPages: tp } = props
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const set = new Set([1, tp, page, page - 1, page + 1])
  const sorted = [...set].filter((p) => p >= 1 && p <= tp).sort((a, b) => a - b)
  const out: (number | "…")[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push("…")
    out.push(p)
    prev = p
  }
  return out
}

const from = () => (props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1)
const to = () => Math.min(props.page * props.perPage, props.total)
</script>

<template>
  <div
    v-if="props.total > 0"
    class="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900 bg-ink-50 px-4 py-3"
  >
    <p class="font-mono text-[11px] tracking-wide text-ink-500">
      Showing <span class="font-semibold text-ink-900">{{ from() }}–{{ to() }}</span>
      of <span class="font-semibold text-ink-900">{{ props.total }}</span> records
    </p>
    <div class="flex items-center gap-1">
      <button
        class="flex size-7 items-center justify-center border border-ink-300 bg-white font-mono text-xs text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-950 disabled:pointer-events-none disabled:opacity-30"
        :disabled="props.page <= 1"
        aria-label="Previous page"
        @click="emit('change', props.page - 1)"
      >
        <AppIcon name="chevron-right" :size="13" class="rotate-180" />
      </button>
      <template v-for="(p, i) in pagesToShow()" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="px-1 font-mono text-[11px] text-ink-300">…</span>
        <button
          v-else
          class="flex h-7 min-w-7 items-center justify-center border px-1 font-mono text-xs transition-colors"
          :class="
            p === props.page
              ? 'border-ink-900 bg-ink-900 font-semibold text-paper'
              : 'border-ink-300 bg-white text-ink-600 hover:border-ink-900 hover:text-ink-950'
          "
          @click="emit('change', p)"
        >
          {{ p }}
        </button>
      </template>
      <button
        class="flex size-7 items-center justify-center border border-ink-300 bg-white font-mono text-xs text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-950 disabled:pointer-events-none disabled:opacity-30"
        :disabled="props.page >= props.totalPages"
        aria-label="Next page"
        @click="emit('change', props.page + 1)"
      >
        <AppIcon name="chevron-right" :size="13" />
      </button>
    </div>
  </div>
</template>
