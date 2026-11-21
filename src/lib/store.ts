import { useSyncExternalStore } from 'react'
import { CASES, type Case } from '../data/demo'

const KEY = 'joblens.case'

function initial(): string {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && CASES.some((c) => c.id === saved)) return saved
  } catch {
    /* localStorage 不可用时静默降级 */
  }
  return CASES[0].id
}

let caseId: string = initial()
const listeners = new Set<() => void>()

export function setCaseId(id: string) {
  if (!CASES.some((c) => c.id === id)) return
  caseId = id
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* noop */
  }
  listeners.forEach((fn) => fn())
}

export function useCaseId(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => caseId,
    () => caseId,
  )
}

export function useCase(): Case {
  const id = useCaseId()
  return CASES.find((c) => c.id === id) ?? CASES[0]
}
