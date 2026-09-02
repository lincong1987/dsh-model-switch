/**
 * Composer-chain entry that claims plan-review waits (higher priority than stock).
 * The question carrier is the official ui-user-questions value; the plan-review
 * narrowing is local (plan-review.ts).
 */

import { useMemo } from 'react'
import type { QuestionWait } from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { ComposerChainProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ClientRemote, SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { ConfigStore } from './config-store.ts'
import type { LocaleKey } from './locales.ts'
import type { ModelCatalogAccess } from './ModelPicker.tsx'
import { planReviewOf, isQuestionCarrier } from './plan-review.ts'
import { PlanReviewPanel } from './PlanReviewPanel.tsx'

export interface PlanReviewComposerInjected {
  store: ConfigStore
  remote: ClientRemote
  access: ModelCatalogAccess
  t: (key: LocaleKey) => string
  isSessionRunning: (sessionId: SessionId) => boolean
}

export type PlanReviewComposerProps =
  PropsRuntime<'conversation.composer'>
  & { matched: QuestionWait }
  & PropsLocale<'model-switch'>
  & Partial<PlanReviewComposerInjected>

/** Select only plan-review question waits. */
export function selectPlanReview({ pendingInteraction }: ComposerChainProps): QuestionWait | null {
  if (!isQuestionCarrier(pendingInteraction)) return null
  return planReviewOf(pendingInteraction.questions) !== undefined ? pendingInteraction : null
}

export function PlanReviewComposer(props: PlanReviewComposerProps) {
  const { matched, store, remote, access, t, isSessionRunning } = props
  const review = useMemo(() => planReviewOf(matched.questions), [matched])
  if (
    store === undefined
    || remote === undefined
    || access === undefined
    || t === undefined
    || isSessionRunning === undefined
    || review === undefined
  ) {
    return null
  }
  return (
    <PlanReviewPanel
      pending={matched}
      review={review}
      store={store}
      remote={remote}
      access={access}
      t={t}
      isSessionRunning={isSessionRunning}
    />
  )
}
