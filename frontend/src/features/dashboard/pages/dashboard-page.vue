<script setup lang="ts">
import { computed } from "vue"
import { useDashboard } from "@/features/dashboard/composables/use-dashboard"
import { fileExtension, formatDate, initialsOf } from "@/shared/lib/format"
import DataState from "@/shared/components/ui/data-state.vue"
import EmptyState from "@/shared/components/ui/empty-state.vue"
import AppIcon from "@/shared/components/ui/app-icon.vue"

const { data, isPending, error, refetch } = useDashboard()

const stats = computed(() => [
  { label: "Folders", value: data.value?.totalFolders ?? 0, icon: "folder" as const, ref: "02" },
  { label: "Files", value: data.value?.totalFiles ?? 0, icon: "file" as const, ref: "03" },
  { label: "Departments", value: data.value?.totalDepartments ?? 0, icon: "users" as const, ref: "04" },
])

const latest = computed(() => data.value?.latestFiles ?? [])
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-6 sm:mb-8">
      <p class="eyebrow mb-1 text-brass-600">Section 01 · Administrator desk</p>
      <h1 class="font-display text-3xl font-black text-ink-950 sm:text-4xl">Cabinet overview</h1>
      <p class="mt-2 font-mono text-xs text-ink-500">
        A steward's glance at everything under lock and key.
      </p>
    </div>

    <DataState :loading="isPending" :error="error" @retry="refetch()">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="relative border border-ink-900 bg-white p-5 shadow-plate transition-transform hover:-translate-y-0.5"
          :class="i === 0 ? 'sm:rotate-[-0.6deg]' : i === 2 ? 'sm:rotate-[0.6deg]' : ''"
        >
          <div class="absolute right-4 top-3 font-display text-4xl font-black text-ink-100">
            {{ stat.ref }}
          </div>
          <div class="relative">
            <div class="mb-3 flex size-9 items-center justify-center border border-ink-900 bg-brass-100 text-brass-700">
              <AppIcon :name="stat.icon" :size="17" />
            </div>
            <p class="font-display text-3xl font-black tabular-nums text-ink-950 sm:text-4xl">{{ stat.value }}</p>
            <p class="eyebrow mt-1 text-ink-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Latest filings -->
      <div class="mt-6 border border-ink-900 bg-white shadow-plate sm:mt-8">
        <div class="flex items-center justify-between border-b border-ink-900 bg-ink-50 px-3 py-2.5 sm:px-4">
          <p class="eyebrow text-ink-500">Latest filings</p>
          <p class="font-mono text-[11px] text-ink-400">{{ latest.length }} most recent</p>
        </div>

        <EmptyState
          v-if="latest.length === 0"
          icon="inbox"
          title="Nothing filed yet"
          message="Upload the first document from the Files index."
        />

        <ol v-else class="divide-y divide-ink-100">
          <li
            v-for="(file, i) in latest"
            :key="file.id"
            class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-3 transition-colors hover:bg-brass-50/60 sm:gap-x-4 sm:px-4"
          >
            <span class="hidden font-display text-lg font-black text-ink-200 tabular-nums sm:block">
              {{ String(i + 1).padStart(2, "0") }}
            </span>
            <span
              class="flex size-8 items-center justify-center border border-ink-900 bg-ink-800 font-mono text-[10px] font-semibold uppercase text-brass-300"
            >
              {{ fileExtension(file.fileName) || "file" }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-display text-sm font-semibold text-ink-900">{{ file.title }}</p>
              <p class="truncate font-mono text-[10px] text-ink-400">
                {{ file.folder.name }} · {{ file.department.name }}
              </p>
            </div>
            <div class="hidden text-right sm:block">
              <p class="font-mono text-[11px] text-ink-600">{{ formatDate(file.uploadedAt) }}</p>
              <p class="flex items-center justify-end gap-1 font-mono text-[10px] text-ink-300">
                <span class="flex size-4 items-center justify-center bg-ink-100 font-mono text-[8px] text-ink-600">
                  {{ initialsOf(file.uploadedBy.email) }}
                </span>
                {{ file.uploadedBy.email }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </DataState>
  </div>
</template>
