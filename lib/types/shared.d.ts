/**
 * Shared types and pure helpers (host + client safe).
 */
/** One provider/model/(optional effort) selection. */
export interface ModelSelectionConfig {
    provider: string;
    model: string;
    reasoningEffort?: string;
}
/** Follow the parent/main session model, or use an explicit selection. */
export interface RouteSwitchConfig {
    mode: 'follow-main' | 'custom';
    selection?: ModelSelectionConfig;
}
/** Full plugin settings section. */
export interface Config {
    /** Model route for in-process subagents. */
    subagent?: RouteSwitchConfig;
    /** Default model for plan-mode execution after Approve. */
    planExecute?: RouteSwitchConfig;
}
/** Settings namespace string (must match host registration). */
export declare const MODEL_SWITCH_NS = "model-switch";
/** Resolve a route to an explicit selection, or undefined when following main. */
export declare function resolveCustomSelection(route: RouteSwitchConfig | undefined): ModelSelectionConfig | undefined;
/** Effective selection for plan execute: panel override > settings custom > undefined (main). */
export declare function resolvePlanExecuteSelection(settings: Config | undefined, panelOverride: ModelSelectionConfig | undefined): ModelSelectionConfig | undefined;
