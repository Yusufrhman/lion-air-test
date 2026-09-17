<script setup lang="ts">
import AppIcon from "./app-icon.vue"

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    width?: string
  }>(),
  { width: "max-w-md" },
)

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/45 p-4 backdrop-blur-[2px] sm:items-center"
        @keydown.esc="open = false"
      >
        <div
          class="fold-corner relative w-full border border-ink-900 bg-paper shadow-[6px_6px_0_0_var(--color-ink-950)]"
          :class="props.width"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-start justify-between gap-4 border-b border-ink-900 bg-ink-50 px-5 py-3">
            <div>
              <h2 class="font-display text-lg font-semibold text-ink-950">{{ props.title }}</h2>
              <p v-if="props.subtitle" class="mt-0.5 font-mono text-[11px] text-ink-500">
                {{ props.subtitle }}
              </p>
            </div>
            <button
              class="-mr-1 p-1 text-ink-400 transition-colors hover:text-ink-900"
              aria-label="Close"
              @click="open = false"
            >
              <AppIcon name="x" :size="18" />
            </button>
          </div>
          <div class="px-5 py-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
