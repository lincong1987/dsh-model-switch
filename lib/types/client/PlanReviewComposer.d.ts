/**
 * Composer-chain entry that claims plan-review waits (higher priority than stock).
 */
import type { ComposerChainProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client';
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { ConfigStore } from './config-store.ts';
import type { LocaleKey } from './locales.ts';
import { type QuestionWait } from './plan-review.ts';
export interface PlanReviewComposerInjected {
    store: ConfigStore;
    api: ConnectionHandle['api'];
    t: (key: LocaleKey) => string;
    isSessionRunning: (sessionId: SessionId) => boolean;
}
export type PlanReviewComposerProps = PropsRuntime<'conversation.composer'> & {
    matched: QuestionWait;
} & PropsLocale<'model-switch'> & Partial<PlanReviewComposerInjected>;
/** Select only plan-review question waits. */
export declare function selectPlanReview({ interactions }: ComposerChainProps): QuestionWait | null;
export declare function PlanReviewComposer(props: PlanReviewComposerProps): import("react").JSX.Element | null;
