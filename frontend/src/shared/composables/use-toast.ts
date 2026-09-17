import { readonly, ref } from "vue"

export type ToastTone = "success" | "error" | "info"

export interface ToastItem {
  id: number
  tone: ToastTone
  title: string
  detail?: string
}

const items = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function push(tone: ToastTone, title: string, detail?: string) {
    const id = ++seq
    items.value.push({ id, tone, title, detail })
    setTimeout(() => dismiss(id), 4200)
  }

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return {
    items: readonly(items),
    dismiss,
    success: (title: string, detail?: string) => push("success", title, detail),
    error: (title: string, detail?: string) => push("error", title, detail),
    info: (title: string, detail?: string) => push("info", title, detail),
  }
}
