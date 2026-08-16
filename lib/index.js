/**
 * Host half of dsh-model-switch: persist settings and inject subagent model routes.
 */
import { installSettingsSection } from '@deepseek-ai/dsh-settings';
import { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE, resolveCustomSelection, } from "./config.js";
import { installConfigHttp } from "./config-http.js";
import { mergeAgentOptions } from "./merge.js";
import { effortFromSelection, installSessionLabelTracking, installSessionLabelsHttp, SessionLabelRegistry, } from "./session-labels.js";
export { resolveCustomSelection, resolvePlanExecuteSelection, } from "./shared.js";
export { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE };
export { CONFIG_ROUTE } from "./config-http.js";
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
/** Patch agentOptions on a continuable start spec. */
function withContinuableOptions(spec, selection) {
    return {
        ...spec,
        request: {
            ...spec.request,
            agentOptions: mergeAgentOptions(spec.request.agentOptions, selection),
        },
    };
}
/**
 * Install settings + wrap subagent start paths + optional child effort injection.
 * @param ctx - host plugin context.
 * @param config - composition-entry defaults.
 */
export function apply(ctx, config = {}) {
    let current = () => config;
    installSettingsSection(ctx, MODEL_SWITCH_SETTINGS_NAMESPACE, ConfigSchema, config, {
        setSource: (source) => { current = source; },
        onChange: () => { },
    });
    // Web clients cannot mutate third-party namespaces through settings.*; expose
    // a same-origin HTTP surface that writes the host-registered section.
    installConfigHttp(ctx, () => current(), async (next) => {
        const settings = ctx.get('settings');
        if (settings === undefined)
            throw new Error('settings service unavailable');
        await settings.replace(MODEL_SWITCH_SETTINGS_NAMESPACE, next);
        return current();
    });
    const labels = new SessionLabelRegistry();
    installSessionLabelsHttp(ctx, labels);
    installSessionLabelTracking(ctx, labels, () => (effortFromSelection(resolveCustomSelection(current().subagent))));
    const runtime = ctx.subagents;
    const originalStart = runtime.start.bind(runtime);
    const originalStartContinuable = runtime.startContinuable.bind(runtime);
    ctx.effect(() => {
        runtime.start = async (providerName, request) => {
            const selection = resolveCustomSelection(current().subagent);
            if (selection === undefined) {
                if (current().subagent?.mode === 'custom') {
                    ctx.logger.warn('dsh-model-switch: subagent mode is custom but selection is incomplete; following parent');
                }
                return originalStart(providerName, request);
            }
            return originalStart(providerName, withSubagentOptions(request, selection));
        };
        runtime.startContinuable = async (spec) => {
            const selection = resolveCustomSelection(current().subagent);
            if (selection === undefined) {
                if (current().subagent?.mode === 'custom') {
                    ctx.logger.warn('dsh-model-switch: subagent mode is custom but selection is incomplete; following parent');
                }
                return originalStartContinuable(spec);
            }
            return originalStartContinuable(withContinuableOptions(spec, selection));
        };
        return () => {
            runtime.start = originalStart;
            runtime.startContinuable = originalStartContinuable;
        };
    }, 'model-switch: wrap subagent start');
    // Reasoning effort is not part of AgentOptions; inject on child agent/request.
    ctx.on('agent/created', ({ agent }) => {
        if (agent.session.header.origin !== 'subagent')
            return;
        const selection = resolveCustomSelection(current().subagent);
        const effort = selection?.reasoningEffort;
        if (effort === undefined || effort.length === 0)
            return;
        agent.ctx.on('agent/request', async (_payload, next) => {
            const seed = await next();
            return Object.assign({}, seed, { reasoningEffort: effort });
        });
    });
}
