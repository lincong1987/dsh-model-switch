/**
 * Host settings schema for dsh-model-switch.
 */

import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import type { Config, ModelSelectionConfig, RouteSwitchConfig } from './shared.ts'

export type { Config, ModelSelectionConfig, RouteSwitchConfig } from './shared.ts'
export {
  MODEL_SWITCH_NS,
  resolveCustomSelection,
  resolvePlanExecuteSelection,
} from './shared.ts'

/** Persisted settings namespace. */
export const MODEL_SWITCH_SETTINGS_NAMESPACE = settingsNamespace('model-switch')

const SelectionSchema: z<ModelSelectionConfig> = z.object({
  provider: z.string().required(),
  model: z.string().required(),
  reasoningEffort: z.string(),
})

const RouteSchema: z<RouteSwitchConfig> = z.object({
  mode: z.union(['follow-main', 'custom'] as const).default('follow-main'),
  selection: SelectionSchema.default(undefined as unknown as ModelSelectionConfig),
})

/** Schemastery schema for the settings section / composition entry. */
export const ConfigSchema: z<Config> = z.object({
  subagent: RouteSchema.default({ mode: 'follow-main' }),
  planExecute: RouteSchema.default({ mode: 'follow-main' }),
})
