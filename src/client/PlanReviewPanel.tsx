/**
 * Enhanced plan-review panel with execution-model picker before Approve.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Button, IconEditOutline16, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelSelectionConfig } from '../shared.ts'
import { resolveCustomSelection, resolvePlanExecuteSelection } from '../shared.ts'
import { ConfigStore } from './config-store.ts'
import { ModelPicker } from './ModelPicker.tsx'
import type { LocaleKey } from './locales.ts'
import { PendingQuestion, type PlanReview } from './plan-review.ts'
import css from './styles.module.css'

export interface PlanReviewPanelProps {
  pending: PendingQuestion
  review: PlanReview
  store: ConfigStore
  api: ConnectionHandle['api']
  t: (key: LocaleKey) => string
}

function tooltip(description: string | undefined): { title?: string } {
  return description === undefined ? {} : { title: description }
}

export function PlanReviewPanel({ pending, review, store, api, t }: PlanReviewPanelProps) {
  const snap = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
  )
  const settingsSelection = useMemo(
    () => resolveCustomSelection(snap.value.planExecute),
    [snap.value.planExecute],
  )

  const [panelSelection, setPanelSelection] = useState<ModelSelectionConfig | undefined>(undefined)
  const [initialized, setInitialized] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void store.load()
  }, [store])

  useEffect(() => {
    if (initialized) return
    if (settingsSelection !== undefined) {
      setPanelSelection(settingsSelection)
      setInitialized(true)
      return
    }
    setInitialized(true)
  }, [initialized, settingsSelection])

  const settle = (send: () => Promise<void>): void => {
    setBusy(true)
    setError(null)
    void send().catch((cause: unknown) => {
      setBusy(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    })
  }

  const approve = (): void => {
    settle(async () => {
      const effective = resolvePlanExecuteSelection(snap.value, panelSelection)
      if (effective !== undefined) {
        const { result } = await api.sessions.selectModel({
          sessionId: pending.sessionId,
          provider: effective.provider,
          model: effective.model,
          ...effective.reasoningEffort === undefined
            ? {}
            : { reasoningEffort: effective.reasoningEffort },
        })
        if (!result.ok) {
          throw new Error(`${result.error.code}: ${result.error.message}`)
        }
      }
      await pending.answer({ answers: [{ id: review.id, selected: [review.approve.label] }] })
    })
  }

  const decide = (label: string): void => {
    settle(() => pending.answer({ answers: [{ id: review.id, selected: [label] }] }))
  }

  const decline = review.decline

  return (
    <div className={css.frame} data-plan-review-key={pending.key} data-model-switch-plan="">
      <section className={css.card} aria-label={review.question}>
        <div className={css.strip}>
          <span className={css.dot} />
          {t('planHeader')}
        </div>
        <div className={css.body} data-plan-review-scroll>
          <MarkdownText text={review.plan} />
        </div>
        <div className={css.footer}>
          <div className={css.feedback} role="status">{error}</div>
          <div className={css.actions}>
            <Button
              variant="ghost"
              icon={<IconEditOutline16 size={14} />}
              disabled={busy}
              onClick={() => { settle(() => pending.cancel()) }}
            >
              {t('planDiscuss')}
            </Button>
            {decline !== undefined && (
              <Button
                variant="outline"
                {...tooltip(decline.description)}
                disabled={busy}
                onClick={() => { decide(decline.label) }}
              >
                {t('planDecline')}
              </Button>
            )}
            <div className={css.planPicker} aria-label={t('planModelLabel')}>
              <ModelPicker
                sessionId={pending.sessionId}
                api={api}
                value={panelSelection}
                disabled={busy}
                t={t}
                onChange={setPanelSelection}
              />
            </div>
            <Button
              variant="primary"
              {...tooltip(review.approve.description)}
              disabled={busy}
              onClick={() => { approve() }}
            >
              {t('planApprove')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
