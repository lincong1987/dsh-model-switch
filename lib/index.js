/**
 * Host half of dsh-model-switch: persist settings and inject subagent model routes.
 *
 * Compatibility note (DSH 0.2.1-rc.2): the `ctx.subagents` service no longer
 * exposes `start()` / `startContinuable()`. Delegation now flows through a single
 * entry point, `startActivation(spec)`, where the child route lives on
 * `spec.request.agentOptions`. We therefore patch `startActivation` when it is
 * present and fall back to the legacy pair on older hosts.
 */
import { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE, resolveCustomSelection, } from "./config.js";
import { resolveRuntimeConfig } from "./shared.js";
import { mergeAgentOptions } from "./merge.js";
import { effortFromSelection, installSessionLabelTracking, installSessionLabelsHttp, SessionLabelRegistry, } from "./session-labels.js";
export { resolveCustomSelection, resolvePlanExecuteSelection, } from "./shared.js";
export { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE };
export { SESSION_LABELS_ROUTE } from "./label.js";
export { formatModelLabel, formatContextWindow } from "./label.js";
/** Schemastery Config export expected by DSH plugin loaders. */
export const Config = ConfigSchema;
export const name = 'model-switch';
export const inject = ['subagents'];
/** Patch agentOptions on a one-shot start request when custom selection is set. */
function withSubagentOptions(request, selection) {
    return {
        ...request,
        agentOptions: mergeAgentOptions(request.agentOptions, selection),
    };
}
/** Patch agentOptions on a continuable start spec (legacy `startContinuable`). */
function withContinuableOptions(spec, selection) {
    const request = (spec.request ?? {});
    return {
        ...spec,
        request: {
            ...request,
            agentOptions: mergeAgentOptions(request.agentOptions, selection),
        },
    };
}
/** Patch agentOptions on a current-DSH activation spec. */
function withActivationOptions(spec, selection) {
    return {
        ...spec,
        request: {
            ...spec.request,
            agentOptions: mergeAgentOptions(spec.request.agentOptions, selection),
        },
    };
}
/**
 * Install settings + wrap subagent start paths.
 * @param ctx - host plugin context.
 * @param config - composition-entry defaults.
 */
export function apply(ctx, config = {}) {
    const current = () => resolveRuntimeConfig(config);
    const labels = new SessionLabelRegistry();
    installSessionLabelsHttp(ctx, labels);
    installSessionLabelTracking(ctx, labels, () => (effortFromSelection(resolveCustomSelection(current().subagent))));
    const runtime = ctx.subagents;
    /** Resolve the configured child selection, warning when it is incomplete. */
    const selectionOf = () => {
        const selection = resolveCustomSelection(current().subagent);
        if (selection === undefined && current().subagent?.mode === 'custom') {
            ctx.logger.warn('dsh-model-switch: subagent mode is custom but selection is incomplete; following parent');
        }
        return selection;
    };
    ctx.effect(() => {
        // Current DSH: one activation entry point owns both local and external children.
        if (typeof runtime.startActivation === 'function') {
            // Keep the unbound original so disposal restores identity exactly; a
            // bound wrapper would accumulate one more layer on every HMR reload.
            const originalStartActivation = runtime.startActivation;
            runtime.startActivation = async (spec) => {
                const selection = selectionOf();
                if (selection === undefined)
                    return originalStartActivation.call(runtime, spec);
                return originalStartActivation.call(runtime, withActivationOptions(spec, selection));
            };
            return () => {
                runtime.startActivation = originalStartActivation;
            };
        }
        // Legacy DSH: separate one-shot and continuable start paths.
        const originalStart = typeof runtime.start === 'function' ? runtime.start : undefined;
        const originalStartContinuable = typeof runtime.startContinuable === 'function'
            ? runtime.startContinuable
            : undefined;
        if (originalStart !== undefined) {
            runtime.start = async (providerName, request) => {
                const selection = selectionOf();
                if (selection === undefined)
                    return originalStart.call(runtime, providerName, request);
                return originalStart.call(runtime, providerName, withSubagentOptions(request, selection));
            };
        }
        if (originalStartContinuable !== undefined) {
            runtime.startContinuable = async (spec) => {
                const selection = selectionOf();
                if (selection === undefined)
                    return originalStartContinuable.call(runtime, spec);
                return originalStartContinuable.call(runtime, withContinuableOptions(spec, selection));
            };
        }
        return () => {
            if (originalStart !== undefined)
                runtime.start = originalStart;
            if (originalStartContinuable !== undefined)
                runtime.startContinuable = originalStartContinuable;
        };
    }, 'model-switch: wrap subagent start');
}
