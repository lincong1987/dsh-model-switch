/**
 * Shared types and pure helpers (host + client safe).
 */

/** One provider/model/(optional effort) selection. */
export interface ModelSelectionConfig {
  provider: string
  model: string
  reasoningEffort?: string
}

/** Follow the parent/main session model, or use an explicit selection. */
export interface RouteSwitchConfig {
  mode: 'follow-main' | 'custom'
  selection?: ModelSelectionConfig
}

/** Full plugin settings section. */
export interface Config {
  /** Model route for in-process subagents. */
  subagent?: RouteSwitchConfig
  /** Default model for plan-mode execution after Approve. */
  planExecute?: RouteSwitchConfig
}

/** Settings namespace string (must match host registration). */
export const MODEL_SWITCH_NS = 'model-switch'

/** Resolve a route to an explicit selection, or undefined when following main. */
export function resolveCustomSelection(route: RouteSwitchConfig | undefined): ModelSelectionConfig | undefined {
  if (route?.mode !== 'custom') return undefined
  const selection = route.selection
  if (selection === undefined) return undefined
  const provider = selection.provider.trim()
  const model = selection.model.trim()
  if (provider.length === 0 || model.length === 0) return undefined
  const effort = selection.reasoningEffort?.trim()
  return {
    provider,
    model,
    ...effort !== undefined && effort.length > 0 ? { reasoningEffort: effort } : {},
  }
}

/** Effective selection for plan execute: panel override > settings custom > undefined (main). */
export function resolvePlanExecuteSelection(
  settings: Config | undefined,
  panelOverride: ModelSelectionConfig | undefined,
): ModelSelectionConfig | undefined {
  if (panelOverride !== undefined) {
    const provider = panelOverride.provider.trim()
    const model = panelOverride.model.trim()
    if (provider.length > 0 && model.length > 0) {
      const effort = panelOverride.reasoningEffort?.trim()
      return {
        provider,
        model,
        ...effort !== undefined && effort.length > 0 ? { reasoningEffort: effort } : {},
      }
    }
  }
  return resolveCustomSelection(settings?.planExecute)
}
