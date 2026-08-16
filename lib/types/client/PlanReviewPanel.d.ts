/**
 * Enhanced plan-review panel with execution-model picker before Approve.
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client';
import { ConfigStore } from './config-store.ts';
import type { LocaleKey } from './locales.ts';
import { PendingQuestion, type PlanReview } from './plan-review.ts';
export interface PlanReviewPanelProps {
    pending: PendingQuestion;
    review: PlanReview;
    store: ConfigStore;
    api: ConnectionHandle['api'];
    t: (key: LocaleKey) => string;
}
export declare function PlanReviewPanel({ pending, review, store, api, t }: PlanReviewPanelProps): import("react").JSX.Element;
