<script setup lang="ts">
import { computed, ref } from "vue"
import AppIcon from "./app-icon.vue"

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string | null
    hint?: string
    type?: string
    placeholder?: string
    autocomplete?: string
    required?: boolean
    toggable?: boolean
  }>(),
  { type: "text", required: false, toggable: false },
)

const model = defineModel<string | number | null>({ default: "" })

const reveal = ref(false)
const effectiveType = computed(() => {
  if (!props.toggable) return props.type
  return reveal.value ? "text" : "password"
})
</script>

<template>
  <label class="block">
    <span v-if="props.label" class="eyebrow mb-1.5 flex items-baseline justify-between text-ink-500">
      <span>{{ props.label }}<span v-if="props.required" class="ml-1 text-rust-600">*</span></span>
      <span v-if="props.hint" class="normal-case tracking-normal text-ink-300">{{ props.hint }}</span>
    </span>
    <span class="relative block">
      <input
        v-model="model"
        :type="effectiveType"
        :placeholder="props.placeholder"
        :autocomplete="props.autocomplete"
        class="w-full border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none"
        :class="[
          props.toggable ? 'pr-9' : '',
          props.error ? 'border-rust-500 focus:border-rust-700' : 'border-ink-200 focus:border-ink-900',
        ]"
      />
      <button
        v-if="props.toggable"
        type="button"
        class="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-ink-300 transition-colors hover:text-ink-900"
        :aria-label="reveal ? 'Hide password' : 'Show password'"
        :aria-pressed="reveal"
        @click="reveal = !reveal"
      >
        <AppIcon :name="reveal ? 'eye-off' : 'eye'" :size="15" />
      </button>
    </span>
    <span v-if="props.error" class="mt-1 block font-mono text-[11px] font-medium text-rust-600">
      {{ props.error }}
    </span>
  </label>
</template>
