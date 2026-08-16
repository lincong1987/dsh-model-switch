/**
 * Host settings schema for dsh-model-switch.
 */
import z from '@deepseek-ai/schemastery';
import type { Config } from './shared.ts';
export type { Config, ModelSelectionConfig, RouteSwitchConfig } from './shared.ts';
export { MODEL_SWITCH_NS, resolveCustomSelection, resolvePlanExecuteSelection, } from './shared.ts';
/** Persisted settings namespace. */
export declare const MODEL_SWITCH_SETTINGS_NAMESPACE: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Schemastery schema for the settings section / composition entry. */
export declare const ConfigSchema: z<Config>;
