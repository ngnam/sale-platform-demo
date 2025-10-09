// src/hooks/useDebounce.ts
import { ref, watch, type Ref } from 'vue';

/**
 * useDebounce - debounce a reactive value
 * @param source initial value or ref
 * @param wait milliseconds to debounce (default 300)
 * @returns debounced ref
 */
export function useDebounce<T>(source: Ref<T> | T, wait = 300) {
  const value = ref<T>((source as any)?.value ?? (source as T)) as Ref<T>;
  const debounced = ref<T>(value.value) as Ref<T>;
  let timer: number | undefined;

  // if source is a ref, watch it; otherwise create a reactive ref not watched externally
  if ((source as Ref<T>) && (source as Ref<T>).hasOwnProperty('value')) {
    watch(source as Ref<T>, (v) => {
      value.value = v;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => { debounced.value = v; }, wait);
    }, { immediate: true });
  } else {
    // when source is primitive, update once
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => { debounced.value = value.value; }, wait);
  }

  return debounced;
}
