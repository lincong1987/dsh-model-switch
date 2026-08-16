import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Composer-chain entry that claims plan-review waits (higher priority than stock).
 */
import { useMemo } from 'react';
import { PlanReviewPanel } from "./PlanReviewPanel.js";
import { PendingQuestion, planReviewOf } from "./plan-review.js";
/** Select only plan-review question waits. */
export function selectPlanReview({ interactions }) {
    const wait = interactions.find((item) => item.kind === 'question');
    if (wait === undefined)
        return null;
    if (planReviewOf(wait.payload.questions) === undefined)
        return null;
    return wait;
}
export function PlanReviewComposer(props) {
    const { matched, store, api, t } = props;
    const pending = useMemo(() => new PendingQuestion(matched), [matched]);
    const review = useMemo(() => planReviewOf(pending.questions), [pending]);
    if (store === undefined || api === undefined || t === undefined || review === undefined) {
        return null;
    }
    return _jsx(PlanReviewPanel, { pending: pending, review: review, store: store, api: api, t: t });
}
