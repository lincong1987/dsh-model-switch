import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced plan-review panel with execution-model picker before Approve.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { IconEditOutline16 } from "./UiGlyphs.js";
import { resolveCustomSelection, resolvePlanExecuteSelection } from "../shared.js";
import { ModelPicker } from "./ModelPicker.js";
import { executeWithTemporaryModel } from "./plan-execution.js";
import { PlanMarkdown } from "./PlanMarkdown.js";
import css from './styles.module.css';
function tooltip(description) {
    return description === undefined ? {} : { title: description };
}
async function selectModel(remote, sessionId, selection) {
    const result = await remote.session.selectModel({
        sessionId,
        provider: selection.provider,
        model: selection.model,
        ...selection.reasoningEffort === undefined
            ? {}
            : { reasoningEffort: selection.reasoningEffort },
    });
    if (!result.ok) {
        throw new Error(`${result.error.code}: ${result.error.message}`);
    }
}
/** Wait until the session runs then settles (or short timeouts). */
async function waitSessionIdle(sessionId, isSessionRunning) {
    const sleep = (ms) => new Promise(resolve => { window.setTimeout(resolve, ms); });
    const start = Date.now();
    // Wait for execution to start (or give up after 2s — may already be idle).
    while (!isSessionRunning(sessionId) && Date.now() - start < 2_000) {
        await sleep(100);
    }
    const busySince = Date.now();
    while (isSessionRunning(sessionId) && Date.now() - busySince < 10 * 60_000) {
        await sleep(250);
    }
}
export function PlanReviewPanel({ pending, review, store, remote, access, t, isSessionRunning, }) {
    const snap = useSyncExternalStore((listener) => store.subscribe(listener), () => store.getSnapshot());
    const settingsSelection = useMemo(() => resolveCustomSelection(snap.value.planExecute), [snap.value.planExecute]);
    const settingsReady = snap.status === 'ready' || snap.status === 'error';
    const [panelSelection, setPanelSelection] = useState(undefined);
    const [pickerReady, setPickerReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!settingsReady || pickerReady)
            return;
        setPanelSelection(settingsSelection);
        setPickerReady(true);
    }, [settingsReady, settingsSelection, pickerReady]);
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
            const answer = () => pending.answer({
                answers: [{ id: review.id, selected: [review.approve.label] }],
            });
            if (effective === undefined) {
                await answer();
                return;
            }
            const previous = toConfig(access.currentSelection(pending.sessionId))
                ?? toConfig((await access.loadCatalog()).default);
            await executeWithTemporaryModel({
                current: previous,
                selected: effective,
                setModel: selection => selectModel(remote, pending.sessionId, selection),
                waitUntilIdle: () => waitSessionIdle(pending.sessionId, isSessionRunning),
                execute: answer,
                onRestoreError: (cause) => {
                    console.warn('dsh-model-switch: failed to restore main session model after plan execute', cause);
                    const detail = cause instanceof Error ? cause.message : String(cause);
                    setError(`${t('restoreError')}: ${detail}`);
                },
            });
        });
    };
    const decide = (label) => {
        settle(() => pending.answer({ answers: [{ id: review.id, selected: [label] }] }));
    };
    const decline = review.decline;
    return (_jsx("div", { className: css.frame, "data-plan-review-key": pending.key, "data-model-switch-plan": "", children: _jsxs("section", { className: css.card, "aria-label": review.question, children: [_jsxs("div", { className: css.strip, children: [_jsx("span", { className: css.dot }), t('planHeader')] }), _jsx("div", { className: css.body, "data-plan-review-scroll": true, children: _jsx(PlanMarkdown, { text: review.plan }) }), _jsxs("div", { className: css.footer, children: [_jsx("div", { className: css.feedback, role: "status", children: error }), _jsxs("div", { className: css.actions, children: [_jsxs("button", { type: "button", className: `${css.planButton} ${css.planButtonGhost}`, disabled: busy, onClick: () => { settle(() => pending.dismiss()); }, children: [_jsx(IconEditOutline16, {}), t('planDiscuss')] }), decline !== undefined && (_jsx("button", { type: "button", className: `${css.planButton} ${css.planButtonOutline}`, ...tooltip(decline.description), disabled: busy, onClick: () => { decide(decline.label); }, children: t('planDecline') })), _jsx("div", { className: css.planPicker, "aria-label": t('planModelLabel'), children: pickerReady ? (_jsx(ModelPicker, { sessionId: pending.sessionId, access: access, value: panelSelection, disabled: busy, t: t, placement: "top", onChange: setPanelSelection })) : null }), _jsx("button", { type: "button", className: `${css.planButton} ${css.planButtonPrimary}`, ...tooltip(review.approve.description), disabled: busy || !pickerReady, onClick: () => { approve(); }, children: t('planApprove') })] })] })] }) }));
}
function toConfig(selection) {
    if (selection === undefined || !selection.provider || !selection.model)
        return undefined;
    return {
        provider: selection.provider,
        model: selection.model,
        ...selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort },
    };
}
