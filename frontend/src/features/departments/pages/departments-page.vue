<script setup lang="ts">
import { computed, ref, watch } from "vue"
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/features/departments/composables/use-department-queries"
import { toApiError } from "@/shared/api/client"
import { formatDate, initialsOf } from "@/shared/lib/format"
import { useToast } from "@/shared/composables/use-toast"
import type { Department } from "@/shared/types/api"
import DataState from "@/shared/components/ui/data-state.vue"
import EmptyState from "@/shared/components/ui/empty-state.vue"
import ConfirmDialog from "@/shared/components/ui/confirm-dialog.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"
import AppIcon from "@/shared/components/ui/app-icon.vue"
import DepartmentFormModal from "@/features/departments/components/department-form-modal.vue"

const toast = useToast()
const { data, isPending, error, refetch } = useDepartments()

const createMutation = useCreateDepartment()
const updateMutation = useUpdateDepartment()
const deleteMutation = useDeleteDepartment()

const formOpen = ref(false)
const editing = ref<Department | null>(null)
const formError = ref<string | null>(null)

const confirmOpen = ref(false)
const deleting = ref<Department | null>(null)

const rows = computed(() => data.value ?? [])
const busy = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
)

watch(formOpen, (open) => {
  if (open) formError.value = null
})

function openCreate() {
  editing.value = null
  formError.value = null
  formOpen.value = true
}

function openEdit(department: Department) {
  editing.value = department
  formError.value = null
  formOpen.value = true
}

async function submitForm(name: string) {
  formError.value = null
  try {
    if (editing.value) {
      const updated = await updateMutation.mutateAsync({ id: editing.value.id, name })
      toast.success("Department updated", `“${updated.name}” has new lettering.`)
    } else {
      const created = await createMutation.mutateAsync(name)
      toast.success("Department created", `“${created.name}” added to the index.`)
    }
    formOpen.value = false
  } catch (err) {
    formError.value = toApiError(err).firstFieldError ?? toApiError(err).message
  }
}

function openDelete(department: Department) {
  deleting.value = department
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  try {
    const message = await deleteMutation.mutateAsync(deleting.value.id)
    toast.success("Department deleted", message)
  } catch (err) {
    const apiError = toApiError(err)
    toast.error("Cannot delete department", apiError.message)
  } finally {
    confirmOpen.value = false
    deleting.value = null
  }
}

const deleteMessage = (department: Department | null) =>
  `Remove “${department?.name}” from the index? This cannot be undone. Departments still referenced by files will be refused.`
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <!-- Heading -->
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div class="min-w-0">
        <p class="eyebrow mb-1 text-brass-600">Section 04</p>
        <h1 class="font-display text-3xl font-black text-ink-950 sm:text-4xl">Departments</h1>
        <p class="mt-2 font-mono text-xs text-ink-500">
          The index of filing sections. Every record belongs to exactly one.
        </p>
      </div>
      <BaseButton variant="brass" icon="plus" size="md" @click="openCreate">New</BaseButton>
    </div>

    <div class="border border-ink-900 bg-white shadow-plate">
      <div class="flex items-center justify-between border-b border-ink-900 bg-ink-50 px-4 py-2.5">
        <p class="eyebrow text-ink-500">Registry</p>
        <p class="font-mono text-[11px] text-ink-400">{{ rows.length }} entries</p>
      </div>

      <DataState :loading="isPending" :error="error" @retry="refetch()">
        <EmptyState
          v-if="rows.length === 0"
          icon="inbox"
          title="No departments yet"
          message="Create your first department to start filing documents."
        />

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[560px] text-left">
            <thead>
              <tr class="border-b border-ink-100 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                <th class="px-3 py-2.5 font-medium sm:px-4">ID</th>
                <th class="px-3 py-2.5 font-medium sm:px-4">Name</th>
                <th class="hidden px-3 py-2.5 font-medium sm:table-cell sm:px-4">Registered</th>
                <th class="px-3 py-2.5 text-right font-medium sm:px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="dept in rows"
                :key="dept.id"
                class="group border-b border-ink-100 transition-colors last:border-0 hover:bg-brass-50/60"
              >
                <td class="px-3 py-3 font-mono text-xs text-ink-400 sm:px-4">{{ dept.id }}</td>
                <td class="px-3 py-3 sm:px-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex size-8 shrink-0 items-center justify-center border border-ink-200 bg-paper font-mono text-[11px] font-semibold text-ink-600"
                    >
                      {{ initialsOf(dept.name) }}
                    </span>
                    <div class="max-w-[12rem] sm:max-w-none">
                      <p class="truncate font-display text-base font-semibold text-ink-900">{{ dept.name }}</p>
                      <p class="font-mono text-[10px] uppercase tracking-wider text-ink-300">
                        section / {{ dept.id }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="hidden px-3 py-3 font-mono text-[11px] text-ink-500 sm:table-cell sm:px-4">
                  {{ formatDate(dept.createdAt) }}
                </td>
                <td class="px-3 py-3 sm:px-4">
                  <div class="flex justify-end gap-1.5 opacity-60 transition-opacity group-hover:opacity-100 max-sm:opacity-100">
                    <BaseButton variant="ghost" size="sm" icon="pencil" title="Edit" @click="openEdit(dept)">
                      <span class="hidden sm:inline">Edit</span>
                    </BaseButton>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      icon="trash"
                      title="Delete"
                      class="!text-rust-600"
                      @click="openDelete(dept)"
                    >
                      <span class="hidden sm:inline">Delete</span>
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DataState>
    </div>

    <p v-if="rows.length > 0" class="mt-3 flex items-center gap-2 font-mono text-[11px] text-ink-400">
      <AppIcon name="alert" :size="12" />
      Departments referenced by files cannot be deleted — the API will refuse with a conflict.
    </p>

    <DepartmentFormModal
      v-model="formOpen"
      :department="editing"
      :busy="busy"
      :error="formError"
      @submit="submitForm"
      @close="formOpen = false"
    />

    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete department"
      :message="deleteMessage(deleting)"
      confirm-label="Delete"
      :busy="deleteMutation.isPending.value"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
