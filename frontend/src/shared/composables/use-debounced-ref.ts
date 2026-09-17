import { ref, watch, type Ref } from "vue"

export function useDebouncedRef(source: Ref<string>, delay = 350): Ref<string> {
  const debounced = ref(source.value) as Ref<string>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  return debounced
}
