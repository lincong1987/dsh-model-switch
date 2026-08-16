import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced plan-review panel with execution-model picker before Approve.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, IconEditOutline16, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
import { resolveCustomSelection, resolvePlanExecuteSelection } from "../shared.js";
import { ModelPicker } from "./ModelPicker.js";
import css from './styles.module.css';
function tooltip(description) {
    return description === undefined ? {} : { title: description };
}
export function PlanReviewPanel({ pending, review, store, api, t }) {
    const snap = useSyncExternalStore((listener) => store.subscribe(listener), () => store.getSnapshot());
    const settingsSelection = useMemo(() => resolveCustomSelection(snap.value.planExecute), [snap.value.planExecute]);
    const [panelSelection, setPanelSelection] = useState(undefined);
    const [initialized, setInitialized] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        void store.load();
    }, [store]);
    useEffect(() => {
        if (initialized)
            return;
        if (settingsSelection !== undefined) {
            setPanelSelection(settingsSelection);
            setInitialized(true);
            return;
        }
        setInitialized(true);
    }, [initialized, settingsSelection]);
    const settle = (send) => {
        setBusy(true);
        setError(null);
        void send().catch((cause) => {
            setBusy(false);
            setError(cause instanceof Error ? cause.message : String(cause));
        });
    };
    const approve = () => {
        settle(async () => {
            const effective = resolvePlanExecuteSelection(snap.value, panelSelection);
            if (effective !== undefined) {
                const { result } = await api.sessions.selectModel({
                    sessionId: pending.sessionId,
                    provider: effective.provider,
                    model: effective.model,
                    ...effective.reasoningEffort === undefined
                        ? {}
                        : { reasoningEffort: effective.reasoningEffort },
                });
                if (!result.ok) {
                    throw new Error(`${result.error.code}: ${result.error.message}`);
                }
            }
            await pending.answer({ answers: [{ id: review.id, selected: [review.approve.label] }] });
        });
    };
    const decide = (label) => {
        settle(() => pending.answer({ answers: [{ id: review.id, selected: [label] }] }));
    };
    const decline = review.decline;
    return (_jsx("div", { className: css.frame, "data-plan-review-key": pending.key, "data-model-switch-plan": "", children: _jsxs("section", { className: css.card, "aria-label": review.question, children: [_jsxs("div", { className: css.strip, children: [_jsx("span", { className: css.dot }), t('planHeader')] }), _jsx("div", { className: css.body, "data-plan-review-scroll": true, children: _jsx(MarkdownText, { text: review.plan }) }), _jsxs("div", { className: css.footer, children: [_jsx("div", { className: css.feedback, role: "status", children: error }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "ghost", icon: _jsx(IconEditOutline16, { size: 14 }), disabled: busy, onClick: () => { settle(() => pending.cancel()); }, children: t('planDiscuss') }), decline !== undefined && (_jsx(Button, { variant: "outline", ...tooltip(decline.description), disabled: busy, onClick: () => { decide(decline.label); }, children: t('planDecline') })), _jsx("div", { className: css.planPicker, "aria-label": t('planModelLabel'), children: _jsx(ModelPicker, { sessionId: pending.sessionId, api: api, value: panelSelection, disabled: busy, t: t, onChange: setPanelSelection }) }), _jsx(Button, { variant: "primary", ...tooltip(review.approve.description), disabled: busy, onClick: () => { approve(); }, children: t('planApprove') })] })] })] }) }));
}
