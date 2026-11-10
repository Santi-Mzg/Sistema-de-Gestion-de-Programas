"use client"

import { useCallback, useSyncExternalStore } from "react"

const preferenceChange = "silabus:preference-change"
const serverSnapshot = () => undefined

/** Sincroniza preferencias locales sin leer el almacenamiento durante el render SSR. */
export function useStoredPreference(key: string) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange)
    window.addEventListener(preferenceChange, onChange)
    return () => {
      window.removeEventListener("storage", onChange)
      window.removeEventListener(preferenceChange, onChange)
    }
  }, [])
  const getSnapshot = useCallback(() => localStorage.getItem(key), [key])
  const value = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot)
  const setValue = useCallback((nextValue: string) => {
    if (localStorage.getItem(key) === nextValue) return
    localStorage.setItem(key, nextValue)
    window.dispatchEvent(new Event(preferenceChange))
  }, [key])

  return [value, setValue] as const
}
