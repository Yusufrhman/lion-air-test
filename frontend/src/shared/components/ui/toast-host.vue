<script setup lang="ts">
import { useToast } from "@/shared/composables/use-toast"
import AppIcon from "../ui/app-icon.vue"

const toast = useToast()

const toneStyles = {
  success: "border-ink-900 bg-moss-100 text-moss-600",
  error: "border-ink-900 bg-rust-100 text-rust-700",
  info: "border-ink-900 bg-brass-100 text-brass-700",
}

const toneIcons = { success: "check", error: "alert", info: "shield" } as const
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2">
      <TransitionGroup
        enter-active-class="duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        leave-active-class="duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-for="item in toast.items.value"
          :key="item.id"
          class="pointer-events-auto flex items-start gap-3 border bg-paper p-3 shadow-plate"
          :class="toneStyles[item.tone]"
        >
          <div class="mt-0.5 border border-current p-0.5">
            <AppIcon :name="toneIcons[item.tone]" :size="14" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-mono text-xs font-semibold uppercase tracking-wider">{{ item.title }}</p>
            <p v-if="item.detail" class="mt-1 break-words text-xs leading-relaxed text-ink-600">
              {{ item.detail }}
            </p>
          </div>
          <button
            class="p-0.5 text-ink-400 transition-colors hover:text-ink-900"
            aria-label="Dismiss"
            @click="toast.dismiss(item.id)"
          >
            <AppIcon name="x" :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
