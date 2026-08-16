/**
 * Composer-chain entry that claims plan-review waits (higher priority than stock).
 */

import { useMemo } from 'react'
import type { ComposerChainProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { ConfigStore } from './config-store.ts'
import type { LocaleKey } from './locales.ts'
import { PlanReviewPanel } from './PlanReviewPanel.tsx'
import { PendingQuestion, planReviewOf, type QuestionWait } from './plan-review.ts'

export interface PlanReviewComposerInjected {
  store: ConfigStore
  api: ConnectionHandle['api']
  t: (key: LocaleKey) => string
}

export type PlanReviewComposerProps =
  PropsRuntime<'conversation.composer'>
  & { matched: QuestionWait }
  & PropsLocale<'model-switch'>
  & Partial<PlanReviewComposerInjected>

/** Select only plan-review question waits. */
export function selectPlanReview({ interactions }: ComposerChainProps): QuestionWait | null {
  const wait = interactions.find((item): item is QuestionWait => item.kind === 'question')
  if (wait === undefined) return null
  if (planReviewOf(wait.payload.questions) === undefined) return null
  return wait
}

export function PlanReviewComposer(props: PlanReviewComposerProps) {
  const { matched, store, api, t } = props
  const pending = useMemo(() => new PendingQuestion(matched), [matched])
  const review = useMemo(() => planReviewOf(pending.questions), [pending])
  if (store === undefined || api === undefined || t === undefined || review === undefined) {
    return null
  }
  return <PlanReviewPanel pending={pending} review={review} store={store} api={api} t={t} />
}
