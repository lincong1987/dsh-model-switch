/**
 * Host half of dsh-model-switch: persist settings and inject subagent model routes.
 */
import type { Context } from '@deepseek-ai/cordis';
import { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE } from './config.ts';
import type { Config as ModelSwitchConfig } from './shared.ts';
export { resolveCustomSelection, resolvePlanExecuteSelection, } from './shared.ts';
export type { Config as ModelSwitchConfig } from './shared.ts';
export { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE };
export { CONFIG_ROUTE } from './config-http.ts';
/** Schemastery Config export expected by DSH plugin loaders. */
export declare const Config: import("@deepseek-ai/schemastery").default<ModelSwitchConfig>;
export declare const name = "model-switch";
export declare const inject: string[];
/**
 * Install settings + wrap subagent start paths + optional child effort injection.
 * @param ctx - host plugin context.
 * @param config - composition-entry defaults.
 */
export declare function apply(ctx: Context, config?: ModelSwitchConfig): void;
