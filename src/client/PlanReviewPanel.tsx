/**
 * Enhanced plan-review panel with execution-model picker before Approve.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Button, IconEditOutline16, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
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
  /** Live session running bit (survives panel unmount via list snapshot). */
  isSessionRunning: (sessionId: SessionId) => boolean
}

function tooltip(description: string | undefined): { title?: string } {
  return description === undefined ? {} : { title: description }
}

function sameSelection(a: ModelSelectionConfig, b: ModelSelection): boolean {
  return a.provider === b.provider
    && a.model === b.model
    && (a.reasoningEffort ?? undefined) === (b.reasoningEffort ?? undefined)
}

function toConfig(selection: ModelSelection): ModelSelectionConfig | undefined {
  if (!selection.provider || !selection.model) return undefined
  return {
    provider: selection.provider,
    model: selection.model,
    ...selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort },
  }
}

async function selectModel(
  api: ConnectionHandle['api'],
  sessionId: SessionId,
  selection: ModelSelectionConfig,
): Promise<void> {
  const { result } = await api.sessions.selectModel({
    sessionId,
    provider: selection.provider,
    model: selection.model,
    ...selection.reasoningEffort === undefined
      ? {}
      : { reasoningEffort: selection.reasoningEffort },
  })
  if (!result.ok) {
    throw new Error(`${result.error.code}: ${result.error.message}`)
  }
}

/** Wait until the session runs then settles (or short timeouts). */
async function waitSessionIdle(
  sessionId: SessionId,
  isSessionRunning: (sessionId: SessionId) => boolean,
): Promise<void> {
  const sleep = (ms: number) => new Promise<void>(resolve => { window.setTimeout(resolve, ms) })
  const start = Date.now()
  // Wait for execution to start (or give up after 2s — may already be idle).
  while (!isSessionRunning(sessionId) && Date.now() - start < 2_000) {
    await sleep(100)
  }
  const busySince = Date.now()
  while (isSessionRunning(sessionId) && Date.now() - busySince < 10 * 60_000) {
    await sleep(250)
  }
}

export function PlanReviewPanel({
  pending, review, store, api, t, isSessionRunning,
}: PlanReviewPanelProps) {
  const snap = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
  )
  const settingsSelection = useMemo(
    () => resolveCustomSelection(snap.value.planExecute),
    [snap.value.planExecute],
  )

  const settingsReady = snap.status === 'ready' || snap.status === 'error'
  const [panelSelection, setPanelSelection] = useState<ModelSelectionConfig | undefined>(undefined)
  const [pickerReady, setPickerReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void store.load()
  }, [store])

  useEffect(() => {
    if (!settingsReady || pickerReady) return
    setPanelSelection(settingsSelection)
    setPickerReady(true)
  }, [settingsReady, settingsSelection, pickerReady])

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
      let previous: ModelSelectionConfig | undefined
      let switched = false

      if (effective !== undefined) {
        const { result } = await api.sessions.models({ sessionId: pending.sessionId })
        if (!result.ok) {
          throw new Error(`${result.error.code}: ${result.error.message}`)
        }
        previous = toConfig(result.value.current)
        if (previous === undefined || !sameSelection(effective, result.value.current)) {
          await selectModel(api, pending.sessionId, effective)
          switched = true
        }
      }

      await pending.answer({ answers: [{ id: review.id, selected: [review.approve.label] }] })

      if (switched && previous !== undefined) {
        try {
          await waitSessionIdle(pending.sessionId, isSessionRunning)
          await selectModel(api, pending.sessionId, previous)
        } catch (cause: unknown) {
          console.warn(
            'dsh-model-switch: failed to restore main session model after plan execute',
            cause,
          )
        }
      }
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
              {pickerReady ? (
                <ModelPicker
                  sessionId={pending.sessionId}
                  api={api}
                  value={panelSelection}
                  disabled={busy}
                  t={t}
                  placement="top"
                  onChange={setPanelSelection}
                />
              ) : null}
            </div>
            <Button
              variant="primary"
              {...tooltip(review.approve.description)}
              disabled={busy || !pickerReady}
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
