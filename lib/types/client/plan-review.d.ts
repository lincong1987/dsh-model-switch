/**
 * Local plan-review helpers (copied contract; avoid cross-plugin value imports).
 */
import type { PendingWait } from '@deepseek-ai/dsh-client-runtime/client';
import type { QuestionResponsePayload } from '@deepseek-ai/dsh-api-remotes/client';
export type QuestionWait = PendingWait<'question'>;
export type QuestionAnswer = QuestionResponsePayload['answer'];
type QuestionItem = QuestionWait['payload']['questions'][number];
type QuestionOption = NonNullable<QuestionItem['options']>[number];
export interface PlanReview {
    id: string;
    question: string;
    plan: string;
    approve: QuestionOption;
    decline?: QuestionOption;
}
export declare function planReviewOf(questions: readonly QuestionItem[]): PlanReview | undefined;
export declare class PendingQuestion {
    private readonly wait;
    constructor(wait: QuestionWait);
    get key(): string;
    get questions(): QuestionWait['payload']['questions'];
    get sessionId(): QuestionWait['sessionId'];
    answer(answer: QuestionAnswer): Promise<void>;
    cancel(): Promise<void>;
}
export {};
