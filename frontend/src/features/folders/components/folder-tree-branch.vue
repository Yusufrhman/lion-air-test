<script setup lang="ts">
import { computed } from "vue"
import type { FolderNode } from "@/shared/types/api"
import AppIcon from "@/shared/components/ui/app-icon.vue"

export interface FolderMoveEvent {
  dragged: FolderNode
  target: FolderNode
}

const props = defineProps<{
  nodes: FolderNode[]
  selectedId: number | null
  expanded: Set<number>
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [folder: FolderNode]
  toggle: [folder: FolderNode]
  move: [event: FolderMoveEvent]
}>()

const isExpanded = (folder: FolderNode) => props.expanded.has(folder.id)
const isSelected = (folder: FolderNode) => props.selectedId === folder.id
const hasChildren = (folder: FolderNode) => folder.children.length > 0

const sorted = computed(() => [...props.nodes].sort((a, b) => a.name.localeCompare(b.name)))

function onDragStart(event: DragEvent, folder: FolderNode) {
  event.dataTransfer?.setData("application/x-lion-folder", JSON.stringify(folder))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"
}

function onDragOver(event: DragEvent, _folder: FolderNode) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move"
}

function onDrop(event: DragEvent, folder: FolderNode) {
  event.preventDefault()
  const raw = event.dataTransfer?.getData("application/x-lion-folder")
  if (!raw) return
  try {
    const dragged = JSON.parse(raw) as FolderNode
    if (dragged.id === folder.id) return
    emit("move", { dragged, target: folder })
  } catch {
    /* ignore malformed payloads */
  }
}
</script>

<template>
  <ul class="space-y-0.5">
    <li v-for="folder in sorted" :key="folder.id">
      <div
        class="group flex cursor-pointer items-center gap-1 border px-1.5 py-1.5 transition-colors"
        :class="[
          isSelected(folder)
            ? 'border-ink-900 bg-brass-400 text-ink-950'
            : 'border-transparent text-ink-200 hover:bg-ink-900',
        ]"
        :draggable="!props.disabled"
        @click="emit('select', folder)"
        @dragstart="onDragStart($event, folder)"
        @dragover="onDragOver($event, folder)"
        @drop="onDrop($event, folder)"
      >
        <button
          v-if="hasChildren(folder)"
          class="flex size-4 items-center justify-center transition-transform"
          :class="isExpanded(folder) ? 'rotate-90' : ''"
          :aria-label="isExpanded(folder) ? 'Collapse' : 'Expand'"
          @click.stop="emit('toggle', folder)"
        >
          <AppIcon name="chevron-right" :size="11" />
        </button>
        <span v-else class="size-4" />

        <AppIcon name="folder" :size="14" :class="isSelected(folder) ? 'text-ink-800' : 'text-brass-400'" />
        <span class="min-w-0 flex-1 truncate font-mono text-xs">{{ folder.name }}</span>
        <span
          class="font-mono text-[10px]"
          :class="isSelected(folder) ? 'text-ink-700' : 'text-ink-500'"
        >
          {{ folder.children.length + folder.files.length }}
        </span>
      </div>

      <div v-if="hasChildren(folder) && isExpanded(folder)" class="ml-4 border-l border-ink-800 pl-1.5">
        <FolderTreeBranch
          :nodes="folder.children"
          :selected-id="props.selectedId"
          :expanded="props.expanded"
          :disabled="props.disabled"
          @select="emit('select', $event)"
          @toggle="emit('toggle', $event)"
          @move="emit('move', $event)"
        />
      </div>
    </li>
  </ul>
</template>
