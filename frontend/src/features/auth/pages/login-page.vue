<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/features/auth/composables/use-session"
import { toApiError } from "@/shared/api/client"
import BaseInput from "@/shared/components/ui/base-input.vue"
import BaseButton from "@/shared/components/ui/base-button.vue"
import AppIcon from "@/shared/components/ui/app-icon.vue"

const router = useRouter()
const session = useSessionStore()

const email = ref("admin@example.com")
const password = ref("")
const busy = ref(false)
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  busy.value = true
  try {
    await session.login(email.value.trim(), password.value)
    const target = session.isAdmin ? { name: "dashboard" } : { name: "files" }
    await router.replace(target)
  } catch (err) {
    const apiError = toApiError(err)
    error.value = apiError.firstFieldError ?? apiError.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Brand panel -->
    <div class="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-ink-950 p-10 lg:flex">
      <div class="stripes-brass absolute inset-0" aria-hidden="true" />
      <div class="absolute -right-24 -top-24 size-[420px] rounded-full border border-brass-500/20" aria-hidden="true" />
      <div class="absolute -right-16 -top-16 size-[340px] rounded-full border border-brass-500/30" aria-hidden="true" />

      <div class="relative">
        <p class="eyebrow text-brass-300">Lion FMS · Est. 2026</p>
      </div>

      <div class="relative">
        <h1 class="font-display text-6xl font-black leading-[0.95] text-paper">
          The<br />Filing<br /><span class="italic text-brass-300">Cabinet.</span>
        </h1>
        <p class="mt-6 max-w-xs font-mono text-xs leading-relaxed text-ink-300">
          Every department. Every document. Filed once, found forever — with folders that behave
          like folders should.
        </p>
      </div>

      <div class="relative flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400">
        <span class="h-px w-8 bg-brass-500" />
        Archival division
      </div>
    </div>

    <!-- Form panel -->
    <div class="flex flex-1 items-center justify-center bg-paper px-6">
      <div class="w-full max-w-sm">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <div class="flex size-10 items-center justify-center border border-ink-900 bg-ink-950 font-display text-xl font-black text-brass-300">
            L
          </div>
          <p class="eyebrow text-ink-500">Lion FMS</p>
        </div>

        <p class="eyebrow mb-2 text-brass-600">Access register</p>
        <h2 class="font-display text-3xl font-bold text-ink-950">Sign in to your desk</h2>
        <p class="mt-2 font-mono text-xs text-ink-500">
          Records are restricted. Present your credentials to continue.
        </p>

        <form class="mt-8 space-y-4" novalidate @submit.prevent="submit">
          <BaseInput
            v-model="email"
            label="Email address"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
          />
          <BaseInput
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
            toggable
          />

          <p v-if="error" class="flex items-center gap-2 font-mono text-[11px] font-medium text-rust-600">
            <AppIcon name="alert" :size="13" />
            {{ error }}
          </p>

          <BaseButton type="submit" variant="brass" block :loading="busy">
            Login
          </BaseButton>
        </form>

        <div class="mt-8 border border-dashed border-ink-300 bg-white/60 px-4 py-3">
          <p class="eyebrow mb-2 text-ink-400">Demo accounts</p>
          <div class="space-y-1 font-mono text-[11px] leading-relaxed text-ink-500">
            <p><span class="text-ink-900">admin@example.com</span> — full control</p>
            <p><span class="text-ink-900">viewer@example.com</span> — read-only · password: <span class="text-ink-900">password</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
