/**
 * Host settings schema for dsh-model-switch.
 */
import z from '@deepseek-ai/schemastery';
export { MODEL_SWITCH_NS, resolveCustomSelection, resolvePlanExecuteSelection, } from "./shared.js";
/** Settings Remote namespace: the plugin's Loader entry id. */
export const MODEL_SWITCH_SETTINGS_NAMESPACE = 'model-switch';
const SelectionSchema = z.object({
    provider: z.string().required(),
    model: z.string().required(),
    reasoningEffort: z.string(),
});
const RouteSchema = z.object({
    mode: z.union(['follow-main', 'custom']).default('follow-main'),
    selection: SelectionSchema.default(undefined),
});
/** Schemastery schema for the settings section / composition entry. */
export const ConfigSchema = z.object({
    subagent: RouteSchema.default({ mode: 'follow-main' }).volatile(),
    planExecute: RouteSchema.default({ mode: 'follow-main' }).volatile(),
});
