<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useSessionStore } from "@/features/auth/composables/use-session"
import { useToast } from "@/shared/composables/use-toast"
import AppIcon, { type IconName } from "@/shared/components/ui/app-icon.vue"
import ToastHost from "@/shared/components/ui/toast-host.vue"
import { initialsOf } from "@/shared/lib/format"

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const toast = useToast()

interface NavItem {
  name: string
  path: string
  label: string
  index: string
  icon: IconName
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { name: "dashboard", path: "/dashboard", label: "Overview", index: "01", icon: "dashboard", adminOnly: true },
  { name: "folders", path: "/folders", label: "Folders", index: "02", icon: "folder" },
  { name: "files", path: "/files", label: "Files", index: "03", icon: "file" },
  { name: "departments", path: "/departments", label: "Departments", index: "04", icon: "users" },
]

const sidebarOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)

const visibleNav = computed(() => navItems.filter((item) => !item.adminOnly || session.isAdmin))
const activeSection = computed(() => (route.meta.section as string) ?? "")

const clock = computed(() => {
  const now = new Date()
  return now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase()
})

async function signOut() {
  sidebarOpen.value = false
  await session.logout()
  toast.info("Signed out", "The cabinet is locked again.")
  router.replace({ name: "login" })
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-ink-950/55 backdrop-blur-[2px] lg:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-ink-950 text-ink-100 transition-transform duration-200 lg:sticky lg:z-auto lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
    >
      <div class="border-b border-ink-800 px-5 py-5">
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 items-center justify-center border border-brass-500/60 bg-ink-900 font-display text-xl font-black text-brass-300"
          >
            L
          </div>
          <div>
            <p class="font-display text-base font-bold leading-none text-paper">Lion FMS</p>
            <p class="eyebrow mt-1 text-ink-400">File management</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p class="eyebrow px-2 pb-2 text-ink-500">Index</p>
        <RouterLink
          v-for="item in visibleNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="group relative flex items-center gap-3 border border-transparent px-3 py-2.5 transition-colors"
          :class="
            activeSection === item.name
              ? 'bg-brass-400 font-semibold text-ink-950 tab-notch'
              : 'text-ink-300 hover:bg-ink-900 hover:text-paper'
          "
        >
          <span
            class="font-mono text-[10px]"
            :class="activeSection === item.name ? 'text-ink-700' : 'text-ink-500'"
          >
            {{ item.index }}
          </span>
          <AppIcon :name="item.icon" :size="16" />
          <span class="font-mono text-xs uppercase tracking-[0.14em]">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="border-t border-ink-800 p-3">
        <div class="flex items-center gap-3 px-2 py-2">
          <div
            class="flex size-9 items-center justify-center border border-ink-700 bg-ink-900 font-mono text-xs font-semibold text-brass-300"
          >
            {{ initialsOf(session.user?.email ?? "?") }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-mono text-xs text-paper">{{ session.user?.email }}</p>
            <p
              class="stamp mt-1"
              :class="session.isAdmin ? 'text-brass-300 -rotate-2' : 'text-ink-300'"
            >
              {{ session.isAdmin ? "Administrator" : "Viewer" }}
            </p>
          </div>
        </div>
        <button
          class="mt-2 flex w-full items-center gap-3 border border-transparent px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-400 transition-colors hover:bg-ink-900 hover:text-paper"
          @click="signOut"
        >
          <AppIcon name="logout" :size="15" />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex min-h-screen min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-ink-900 bg-paper/95 px-4 py-4 backdrop-blur sm:px-8">
        <div class="flex items-baseline gap-3 sm:gap-4">
          <button
            class="flex size-8 items-center justify-center border border-ink-900 bg-white text-ink-900 transition-colors hover:bg-ink-100 lg:hidden"
            aria-label="Open menu"
            @click="sidebarOpen = true"
          >
            <AppIcon name="menu" :size="15" />
          </button>
          <p class="eyebrow text-brass-600">Archive</p>
          <p class="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 sm:block">{{ clock }}</p>
        </div>
        <p
          class="stamp"
          :class="session.isAdmin ? '-rotate-2 text-rust-600' : 'text-ink-400'"
        >
          {{ session.isAdmin ? "Write access" : "Read only" }}
        </p>
      </header>

      <main class="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <RouterView />
      </main>

      <footer class="border-t border-ink-100 px-4 py-4 sm:px-8">
        <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-300">
          Lion FMS — filed &amp; found
        </p>
      </footer>
    </div>

    <ToastHost />
  </div>
</template>
