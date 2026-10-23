/**
 * Host settings schema for dsh-model-switch.
 */
import z from '@deepseek-ai/schemastery';
import type { RouteSwitchConfig } from './shared.ts';
export type { Config, ModelSelectionConfig, RouteSwitchConfig } from './shared.ts';
export { MODEL_SWITCH_NS, resolveCustomSelection, resolvePlanExecuteSelection, } from './shared.ts';
/** Settings Remote namespace: the plugin's Loader entry id. */
export declare const MODEL_SWITCH_SETTINGS_NAMESPACE = "model-switch";
/** Schemastery schema for the settings section / composition entry. */
export declare const ConfigSchema: z<Schemastery.ObjectS<NoInfer<{
    subagent: z<NoInfer<RouteSwitchConfig>, NoInfer<RouteSwitchConfig>, "volatile-defined">;
    planExecute: z<NoInfer<RouteSwitchConfig>, NoInfer<RouteSwitchConfig>, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    subagent: z<NoInfer<RouteSwitchConfig>, NoInfer<RouteSwitchConfig>, "volatile-defined">;
    planExecute: z<NoInfer<RouteSwitchConfig>, NoInfer<RouteSwitchConfig>, "volatile-defined">;
}>>, "plain">;
