<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    error?: string | null
    required?: boolean
    disabled?: boolean
    placeholder?: string
    options?: { value: number; label: string }[]
  }>(),
  { required: false, disabled: false, placeholder: "Select…" },
)

const model = defineModel<number | null>({ default: null })
</script>

<template>
  <label class="block">
    <span v-if="props.label" class="eyebrow mb-1.5 flex items-baseline justify-between text-ink-500">
      <span>{{ props.label }}<span v-if="props.required" class="ml-1 text-rust-600">*</span></span>
    </span>
    <select
      v-model="model"
      :disabled="props.disabled"
      class="w-full appearance-none border bg-white px-3 py-2 text-sm text-ink-900 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-ink-50"
      :class="props.error ? 'border-rust-500 focus:border-rust-700' : 'border-ink-200 focus:border-ink-900'"
    >
      <option :value="null" disabled>{{ props.placeholder }}</option>
      <option v-for="opt in props.options ?? []" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="props.error" class="mt-1 block font-mono text-[11px] font-medium text-rust-600">
      {{ props.error }}
    </span>
  </label>
</template>
