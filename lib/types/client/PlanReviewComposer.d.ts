/**
 * Composer-chain entry that claims plan-review waits (higher priority than stock).
 * The question carrier is the official ui-user-questions value; the plan-review
 * narrowing is local (plan-review.ts).
 */
import type { QuestionWait } from '@deepseek-ai/dsh-client-ui-user-questions/client';
import type { ComposerChainProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ClientRemote, SessionId } from '@deepseek-ai/dsh-api-remotes/client';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { ConfigStore } from './config-store.ts';
import type { LocaleKey } from './locales.ts';
import type { ModelCatalogAccess } from './ModelPicker.tsx';
export interface PlanReviewComposerInjected {
    store: ConfigStore;
    remote: ClientRemote;
    access: ModelCatalogAccess;
    t: (key: LocaleKey) => string;
    isSessionRunning: (sessionId: SessionId) => boolean;
}
export type PlanReviewComposerProps = PropsRuntime<'conversation.composer'> & {
    matched: QuestionWait;
} & PropsLocale<'model-switch'> & Partial<PlanReviewComposerInjected>;
/** Select only plan-review question waits. */
export declare function selectPlanReview({ pendingInteraction }: ComposerChainProps): QuestionWait | null;
export declare function PlanReviewComposer(props: PlanReviewComposerProps): import("react").JSX.Element | null;
