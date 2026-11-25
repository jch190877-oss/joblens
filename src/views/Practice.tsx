import { useState } from 'react'
import { Button, Shell } from '../components/ui'
import { CASES } from '../data/demo'
import { navigate } from '../lib/router'
import { getCaseAnswers, saveCaseAnswers, setCaseId } from '../lib/store'

const exampleCase = CASES[1]
const exampleQuestion = exampleCase.deep.questions[0]
const exampleRequirement = exampleCase.requirements.find((row) => row.id === exampleCase.deep.reqRef)

export function Practice({ example = false }: { example?: boolean }) {
  const [requirement, setRequirement] = useState(example ? exampleRequirement?.jdLine ?? '' : '')
  const [source, setSource] = useState(example ? exampleCase.deep.raw : '')
  const [fact, setFact] = useState('')
  const [draft, setDraft] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const canDraft = Boolean(requirement.trim() && source.trim() && fact.trim())
  const field = 'mt-2 w-full resize-y rounded-lg border border-ink-600 bg-white px-4 py-3 text-sm leading-relaxed'

  function arrange() {
    const original = source.trim().replace(/[。；;]+$/, '')
    setDraft(original + '；' + fact.trim())
    setCopyStatus('')
  }

  function continueExample() {
    saveCaseAnswers(exampleCase.id, { ...getCaseAnswers(exampleCase.id), [exampleQuestion.id]: fact.trim() })
    setCaseId(exampleCase.id)
    navigate('/deepdive')
  }

  return (
    <Shell className="py-12">
      <header className="mb-7 max-w-3xl">
        <h1 className="editorial-heading text-[38px]">{example ? '体验一道追问' : '用自己的经历练一条'}</h1>
        <p className="mt-3 text-fg-muted">
          {example ? '看看补上一个细节后，原来的经历会变成什么样。' : '选一条岗位要求，写下相关经历，再补一个你能确认的细节。'}
        </p>
        <p className="mt-1 text-sm text-fg-dim">内容在当前页面使用，刷新后清空。职镜按你填写的原文整理，不打分。</p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        <form className="panel space-y-5 rounded-2xl p-6" onSubmit={(event) => { event.preventDefault(); if (canDraft) arrange() }}>
          <label className="block text-sm font-semibold">岗位要求
            <textarea className={field} rows={2} value={requirement} readOnly={example} maxLength={600}
              onChange={(event) => { setRequirement(event.target.value); setDraft(null) }} />
          </label>
          <label className="block text-sm font-semibold">简历原文
            <textarea className={field} rows={3} value={source} readOnly={example} maxLength={1200}
              onChange={(event) => { setSource(event.target.value); setDraft(null) }} />
          </label>
          <label className="block text-sm font-semibold">
            {example ? exampleQuestion.ask : '为了支撑这条岗位要求，你本人做了什么？'}
            <textarea className={field} rows={3} value={fact} maxLength={600} placeholder="填一个能确认的动作、工具或交付物"
              onChange={(event) => { setFact(event.target.value); setDraft(null) }} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={arrange} disabled={!canDraft}>整理成一条证据</Button>
            {example && <Button variant="outline" onClick={() => { setFact(exampleQuestion.chips[0]); setDraft(null) }}>填入示例回答</Button>}
          </div>
        </form>
        <section className="rounded-2xl border border-brand-500/25 bg-ink-900 p-6">
          <h2 className="text-xl font-semibold">核对并编辑草稿</h2>
          {draft !== null ? (
            <>
              <p className="mt-3 text-sm text-fg-muted">新补充的事实：<strong className="text-brand-400">{fact}</strong></p>
              <textarea aria-label="证据草稿" className={field} rows={5} value={draft}
                onChange={(event) => { setDraft(event.target.value); setCopyStatus('') }} />
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => {
                  if (!navigator.clipboard) { setCopyStatus('请选中草稿后手动复制'); return }
                  void navigator.clipboard.writeText(draft).then(() => setCopyStatus('已复制'), () => setCopyStatus('请选中草稿后手动复制'))
                }}>复制草稿</Button>
                {example && <Button variant="soft" onClick={continueExample}>带着回答继续深挖</Button>}
              </div>
              <p role="status" className="mt-2 text-sm text-fg-muted">{copyStatus}</p>
            </>
          ) : <p className="mt-4 text-sm text-fg-muted">填好三个字段后，这里会显示原文和你补充的事实。</p>}
        </section>
      </div>
    </Shell>
  )
}
