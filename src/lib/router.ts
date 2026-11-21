import { useEffect, useState } from 'react'

/**
 * 极简哈希路由。
 * 用 hash 而不是 history 的原因：构建产物可以直接部署到 GitHub Pages /
 * 对象存储 / 本地 dist 目录，不需要任何服务端 rewrite 规则。
 */
export function useRoute(): string {
  const read = () => {
    const raw = window.location.hash.replace(/^#/, '')
    return raw === '' ? '/' : raw
  }

  const [route, setRoute] = useState<string>(read)

  useEffect(() => {
    const onChange = () => {
      setRoute(read())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(to: string) {
  if (window.location.hash.replace(/^#/, '') === to) return
  window.location.hash = to
}

export type NavItem = { label: string; to: string; match?: string[] }

export const NAV: NavItem[] = [
  { label: '分析工作台', to: '/app' },
  { label: '分析报告', to: '/report' },
  { label: '经历深挖', to: '/deepdive' },
  { label: '改写工作台', to: '/rewrite' },
  { label: '方法论', to: '/method' },
]
