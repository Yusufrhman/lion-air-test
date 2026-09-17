<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { useSessionStore } from "@/features/auth/composables/use-session"
import {
  useCreateFolder,
  useDeleteFolder,
  useFolderDetail,
  useFolderTree,
  useUpdateFolder,
} from "@/features/folders/composables/use-folder-queries"
import type { FolderMoveEvent } from "@/features/folders/components/folder-tree-branch.vue"
import { toApiError } from "@/shared/api/client"
import { useToast } from "@/shared/composables/use-toast"
import type { FolderNode } from "@/shared/types/api"
import DataState from "@/shared/components/ui/data-state.vue"
import EmptyState from "@/shared/components/ui/empty-state.vue"
import ConfirmDialog from "@/shared/components/ui/confirm-dialog.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"
import AppIcon from "@/shared/components/ui/app-icon.vue"
import FolderTreeBranch from "@/features/folders/components/folder-tree-branch.vue"
import FolderFormModal from "@/features/folders/components/folder-form-modal.vue"

const toast = useToast()
const session = useSessionStore()
const isAdmin = computed(() => session.isAdmin)

const { data: tree, isPending, error, refetch } = useFolderTree()
const selectedId = ref<number | null>(null)

const detailQuery = useFolderDetail(computed(() => selectedId.value))

const expanded = reactive(new Set<number>())
const formOpen = ref(false)
const formFolder = ref<FolderNode | null>(null)
const formParentId = ref<number | null>(null)
const formError = ref<string | null>(null)

const confirmOpen = ref(false)
const confirmMessage = ref("")
const pendingDeleteId = ref<number | null>(null)
const pendingDeleteName = ref("")

const flatFolders = computed(() => {
  const out: { value: number; label: string }[] = []
  const walk = (nodes: import("@/shared/types/api").FolderNode[], path: string) => {
    for (const node of nodes) {
      const label = path ? `${path} / ${node.name}` : node.name
      out.push({ value: node.id, label })
      walk(node.children, label)
    }
  }
  walk(tree.value ?? [], "")
  return out
})

function collectIds(nodes: import("@/shared/types/api").FolderNode[], acc: number[] = []): number[] {
  for (const n of nodes) {
    acc.push(n.id)
    collectIds(n.children, acc)
  }
  return acc
}

watch(
  tree,
  (nodes) => {
    if (!nodes || expanded.size > 0) return
    for (const id of collectIds(nodes).slice(0, 24)) expanded.add(id)
  },
  { immediate: true },
)

watch(
  tree,
  (nodes) => {
    if (!nodes) return
    if (selectedId.value === null) {
      const first = collectIds(nodes)[0]
      if (first !== undefined) selectedId.value = first
    }
  },
  { immediate: true },
)

function findNode(nodes: import("@/shared/types/api").FolderNode[], id: number): import("@/shared/types/api").FolderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

const selectedNode = computed(() =>
  selectedId.value === null ? null : findNode(tree.value ?? [], selectedId.value),
)

const createMutation = useCreateFolder()
const updateMutation = useUpdateFolder()
const deleteMutation = useDeleteFolder()

watch(formOpen, (open) => {
  if (open) formError.value = null
})

function openCreateRoot() {
  formParentId.value = null
  formFolder.value = null
  formOpen.value = true
}

function openCreateChild() {
  if (selectedId.value === null) return
  formParentId.value = selectedId.value
  formFolder.value = null
  formOpen.value = true
}

function openRename() {
  if (!selectedNode.value) return
  formParentId.value = selectedNode.value.parentId
  formFolder.value = selectedNode.value
  formOpen.value = true
}

function toggle(folder: { id: number }) {
  if (expanded.has(folder.id)) {
    expanded.delete(folder.id)
  } else {
    expanded.add(folder.id)
  }
}

async function submitForm(payload: { name: string; parentId: number | null }) {
  formError.value = null
  try {
    if (formFolder.value) {
      const updated = await updateMutation.mutateAsync({
        id: formFolder.value.id,
        payload: { name: payload.name, parentId: payload.parentId },
      })
      toast.success("Folder updated", `“${updated.name}” now filed correctly.`)
    } else {
      const created = await createMutation.mutateAsync(payload)
      if (payload.parentId !== null) expanded.add(payload.parentId)
      toast.success("Folder created", `“${created.name}” added to the cabinet.`)
    }
    formOpen.value = false
  } catch (err) {
    formError.value = toApiError(err).firstFieldError ?? toApiError(err).message
  }
}

async function onMove(event: FolderMoveEvent) {
  if (!isAdmin.value) {
    toast.error("Read only", "Only administrators can re-file folders.")
    return
  }
  if (event.dragged.id === event.target.id) return
  try {
    await updateMutation.mutateAsync({
      id: event.dragged.id,
      payload: { parentId: event.target.id },
    })
    expanded.add(event.target.id)
    toast.success("Folder re-filed", `“${event.dragged.name}” moved into “${event.target.name}”.`)
  } catch (err) {
    const apiError = toApiError(err)
    toast.error("Cannot move folder", apiError.firstFieldError ?? apiError.message)
  }
}

function openDelete() {
  const node = selectedNode.value
  if (!node) return
  pendingDeleteId.value = node.id
  pendingDeleteName.value = node.name
  confirmMessage.value = `Delete “${node.name}”? Only empty folders can be removed.`
  confirmOpen.value = true
}

async function confirmDelete() {
  if (pendingDeleteId.value === null) return
  try {
    const message = await deleteMutation.mutateAsync(pendingDeleteId.value)
    toast.success("Folder deleted", message)
    selectedId.value = null
  } catch (err) {
    const apiError = toApiError(err)
    toast.error("Cannot delete folder", apiError.message)
  } finally {
    confirmOpen.value = false
    pendingDeleteId.value = null
  }
}

const detail = computed(() => detailQuery.data.value)
const detailLoading = computed(() => detailQuery.isLoading.value)
const detailError = computed(() => detailQuery.error.value as string | null)

const childCount = computed(() => selectedNode.value?.children.length ?? 0)
const fileCount = computed(() => selectedNode.value?.files.length ?? 0)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-8 flex items-end justify-between gap-6">
      <div>
        <p class="eyebrow mb-1 text-brass-600">Section 02</p>
        <h1 class="font-display text-4xl font-black text-ink-950">Folder cabinet</h1>
        <p class="mt-2 font-mono text-xs text-ink-500">
          Drag a folder onto another to re-file it.
        </p>
      </div>
      <BaseButton v-if="isAdmin" variant="brass" icon="plus" @click="openCreateRoot">
        Root folder
      </BaseButton>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <!-- Tree panel -->
      <div class="h-fit border border-ink-900 bg-ink-950 shadow-plate">
        <div class="flex items-center justify-between border-b border-ink-800 px-4 py-2.5">
          <p class="eyebrow text-brass-300">Drawer map</p>
          <button
            class="font-mono text-[10px] uppercase tracking-widest text-ink-400 transition-colors hover:text-brass-300"
            @click="expanded.clear(); refetch()"
          >
            Reset
          </button>
        </div>
        <DataState
          :loading="isPending"
          :error="error"
          class="bg-ink-950 text-ink-100"
          @retry="refetch()"
        >
          <EmptyState
            v-if="(tree ?? []).length === 0"
            icon="folder"
            title="Empty cabinet"
            message="No folders yet — start with a root folder."
          />
          <div v-else class="p-2">
            <FolderTreeBranch
              :nodes="tree ?? []"
              :selected-id="selectedId"
              :expanded="expanded"
              :disabled="!isAdmin"
              @select="selectedId = $event.id; toggle($event)"
              @toggle="toggle"
              @move="onMove"
            />
          </div>
        </DataState>
      </div>

      <!-- Detail panel -->
      <div class="min-w-0 border border-ink-900 bg-white shadow-plate">
        <EmptyState
          v-if="selectedId === null"
          icon="folder"
          title="Select a folder"
          message="Pick a drawer from the cabinet map on the left."
        />

        <template v-else>
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-ink-900 bg-ink-50 px-5 py-4">
            <div class="min-w-0">
              <p class="eyebrow mb-1 text-brass-600">Folder #{{ selectedId }}</p>
              <h2 class="truncate font-display text-2xl font-bold text-ink-950">
                {{ selectedNode?.name ?? "…" }}
              </h2>
              <p class="mt-1 font-mono text-[11px] text-ink-500">
                <template v-if="detail?.parent">Filed under: {{ detail.parent.name }} (#{{ detail.parent.id }})</template>
                <template v-else>Filed under: root</template>
              </p>
            </div>
            <div v-if="isAdmin" class="flex gap-1.5">
              <BaseButton variant="outline" size="sm" icon="pencil" @click="openRename">Rename</BaseButton>
              <BaseButton variant="outline" size="sm" icon="plus" @click="openCreateChild">Subfolder</BaseButton>
              <BaseButton variant="danger" size="sm" icon="trash" @click="openDelete">Delete</BaseButton>
            </div>
          </div>

          <DataState :loading="detailLoading" :error="detailError" @retry="refetch()">
            <div class="grid gap-6 px-5 py-5 sm:grid-cols-2">
              <!-- Subfolders -->
              <section>
                <p class="eyebrow mb-3 flex items-center gap-2 text-ink-400">
                  <AppIcon name="folder" :size="12" /> Subfolders
                  <span class="font-mono text-ink-300">({{ childCount }})</span>
                </p>
                <p v-if="childCount === 0" class="font-mono text-xs text-ink-300">— none —</p>
                <ul v-else class="space-y-1.5">
                  <li
                    v-for="child in detail?.children ?? []"
                    :key="child.id"
                    class="flex cursor-pointer items-center justify-between border border-ink-200 bg-paper px-3 py-2 transition-colors hover:border-ink-900"
                    @click="selectedId = child.id; expanded.add(child.id)"
                  >
                    <span class="flex items-center gap-2 font-mono text-xs text-ink-800">
                      <AppIcon name="folder" :size="13" class="text-brass-500" />
                      {{ child.name }}
                    </span>
                    <AppIcon name="chevron-right" :size="12" class="text-ink-300" />
                  </li>
                </ul>
              </section>

              <!-- Files -->
              <section>
                <p class="eyebrow mb-3 flex items-center gap-2 text-ink-400">
                  <AppIcon name="file" :size="12" /> Files here
                  <span class="font-mono text-ink-300">({{ fileCount }})</span>
                </p>
                <p v-if="fileCount === 0" class="font-mono text-xs text-ink-300">— none —</p>
                <ul v-else class="space-y-1.5">
                  <li
                    v-for="file in detail?.files ?? []"
                    :key="file.id"
                    class="flex items-center justify-between border border-ink-200 bg-paper px-3 py-2"
                  >
                    <span class="flex min-w-0 items-center gap-2 font-mono text-xs text-ink-800">
                      <AppIcon name="file" :size="13" class="text-ink-300" />
                      <span class="truncate">{{ file.name ?? `file-${file.id}` }}</span>
                    </span>
                    <span class="font-mono text-[10px] text-ink-300">#{{ file.id }}</span>
                  </li>
                </ul>
                <p
                  v-if="fileCount > 0"
                  class="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-300"
                >
                  Full metadata lives in the Files index →
                </p>
              </section>
            </div>
          </DataState>
        </template>
      </div>
    </div>

    <FolderFormModal
      v-model="formOpen"
      :folder="formFolder"
      :parent-id="formParentId"
      :flat-folders="flatFolders"
      :busy="createMutation.isPending.value || updateMutation.isPending.value"
      :error="formError"
      @submit="submitForm"
      @close="formOpen = false"
    />

    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete folder"
      :message="confirmMessage"
      confirm-label="Delete"
      :busy="deleteMutation.isPending.value"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
