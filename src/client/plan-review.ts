/**
 * Local plan-review helpers (copied contract; avoid cross-plugin value imports).
 */

import type { PendingWait } from '@deepseek-ai/dsh-client-runtime/client'
import type { QuestionResponsePayload } from '@deepseek-ai/dsh-api-remotes/client'

export type QuestionWait = PendingWait<'question'>
export type QuestionAnswer = QuestionResponsePayload['answer']
type QuestionItem = QuestionWait['payload']['questions'][number]
type QuestionOption = NonNullable<QuestionItem['options']>[number]

export interface PlanReview {
  id: string
  question: string
  plan: string
  approve: QuestionOption
  decline?: QuestionOption
}

export function planReviewOf(questions: readonly QuestionItem[]): PlanReview | undefined {
  if (questions.length !== 1) return undefined
  const question = questions[0] as QuestionItem
  const intent = question.intent
  if (intent?.kind !== 'plan-review' || question.detail === undefined) return undefined
  if (question.multiSelect === true) return undefined
  const options = question.options ?? []
  if (options.length > 2) return undefined
  const approve = options.find(option => option.label === intent.approve)
  if (approve === undefined) return undefined
  const decline = options.find(option => option.label !== intent.approve)
  return {
    id: question.id,
    question: question.question,
    plan: question.detail,
    approve,
    ...decline === undefined ? {} : { decline },
  }
}

export class PendingQuestion {
  constructor(private readonly wait: QuestionWait) {}

  get key(): string {
    return this.wait.key
  }

  get questions(): QuestionWait['payload']['questions'] {
    return this.wait.payload.questions
  }

  get sessionId(): QuestionWait['sessionId'] {
    return this.wait.sessionId
  }

  async answer(answer: QuestionAnswer): Promise<void> {
    const receipt = await this.wait.respond({
      ok: true, value: { sessionId: this.wait.sessionId, answer },
    })
    if (!receipt.accepted) {
      throw new Error(`question response rejected: ${receipt.reason}`)
    }
  }

  async cancel(): Promise<void> {
    const receipt = await this.wait.respond({
      ok: false,
      error: { code: 'cancelled', message: 'the user closed this question request', details: {} },
    })
    if (!receipt.accepted) {
      throw new Error(`question cancellation rejected: ${receipt.reason}`)
    }
  }
}
