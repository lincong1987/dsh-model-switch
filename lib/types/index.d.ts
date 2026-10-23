/**
 * Host half of dsh-model-switch: persist settings and inject subagent model routes.
 *
 * Compatibility note (DSH 0.2.1-rc.2): the `ctx.subagents` service no longer
 * exposes `start()` / `startContinuable()`. Delegation now flows through a single
 * entry point, `startActivation(spec)`, where the child route lives on
 * `spec.request.agentOptions`. We therefore patch `startActivation` when it is
 * present and fall back to the legacy pair on older hosts.
 */
import type { Context } from '@deepseek-ai/cordis';
import { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE } from './config.ts';
import { type RuntimeConfig } from './shared.ts';
export { resolveCustomSelection, resolvePlanExecuteSelection, } from './shared.ts';
export type { Config as ModelSwitchConfig } from './shared.ts';
export { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE };
export { SESSION_LABELS_ROUTE } from './label.ts';
export { formatModelLabel, formatContextWindow } from './label.ts';
/** Schemastery Config export expected by DSH plugin loaders. */
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    subagent: import("@deepseek-ai/schemastery").default<NoInfer<import("./shared.ts").RouteSwitchConfig>, NoInfer<import("./shared.ts").RouteSwitchConfig>, "volatile-defined">;
    planExecute: import("@deepseek-ai/schemastery").default<NoInfer<import("./shared.ts").RouteSwitchConfig>, NoInfer<import("./shared.ts").RouteSwitchConfig>, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    subagent: import("@deepseek-ai/schemastery").default<NoInfer<import("./shared.ts").RouteSwitchConfig>, NoInfer<import("./shared.ts").RouteSwitchConfig>, "volatile-defined">;
    planExecute: import("@deepseek-ai/schemastery").default<NoInfer<import("./shared.ts").RouteSwitchConfig>, NoInfer<import("./shared.ts").RouteSwitchConfig>, "volatile-defined">;
}>>, "plain">;
export declare const name = "model-switch";
export declare const inject: string[];
/**
 * Install settings + wrap subagent start paths.
 * @param ctx - host plugin context.
 * @param config - composition-entry defaults.
 */
export declare function apply(ctx: Context, config?: RuntimeConfig): void;
