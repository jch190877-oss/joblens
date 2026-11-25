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

// Answers belong to the current tab session and stay isolated by case.
const caseAnswers = new Map<string, Record<string, string>>()

export function getCaseAnswers(id: string) {
  return caseAnswers.get(id)
}

export function saveCaseAnswers(id: string, answers: Record<string, string>) {
  caseAnswers.set(id, answers)
}

export function getEvidenceDraft(current: Case) {
  const answers = getCaseAnswers(current.id) ?? {}
  const facts = current.deep.questions.flatMap((question) => {
    const text = answers[question.id]?.trim()
    return text ? [{ token: question.token, label: question.slot, text }] : []
  })
  if (!facts.length) return null
  const pending = current.deep.questions
    .filter((question) => !answers[question.id]?.trim())
    .map((question) => question.slot)
  const byToken = new Map(facts.map((fact) => [fact.token, fact.text]))
  // Use the full sentence only when every slot is backed by an answer.
  const text = pending.length
    ? `${current.deep.raw}\n补充事实：${facts.map((fact) => `${fact.label}：${fact.text}`).join('；')}`
    : current.deep.template.replace(/\{([^}]+)\}/g, (_, token: string) => byToken.get(token) ?? '')
  return { text, pending }
}

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
