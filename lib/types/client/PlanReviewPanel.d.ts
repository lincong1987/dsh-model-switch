/**
 * Enhanced plan-review panel with execution-model picker before Approve.
 */
import type { ClientRemote, SessionId } from '@deepseek-ai/dsh-api-remotes/client';
import type { PlanReview, PendingQuestion } from '@deepseek-ai/dsh-client-ui-user-questions/client';
import { ConfigStore } from './config-store.ts';
import { type ModelCatalogAccess } from './ModelPicker.tsx';
import type { LocaleKey } from './locales.ts';
export interface PlanReviewPanelProps {
    pending: PendingQuestion;
    review: PlanReview;
    store: ConfigStore;
    remote: ClientRemote;
    access: ModelCatalogAccess;
    t: (key: LocaleKey) => string;
    /** Live session running bit (survives panel unmount via list snapshot). */
    isSessionRunning: (sessionId: SessionId) => boolean;
}
export declare function PlanReviewPanel({ pending, review, store, remote, access, t, isSessionRunning, }: PlanReviewPanelProps): import("react").JSX.Element;
