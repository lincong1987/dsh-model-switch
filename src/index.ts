/**
 * Host half of dsh-model-switch: persist settings and inject subagent model routes.
 *
 * Compatibility note (DSH 0.2.1-rc.2): the `ctx.subagents` service no longer
 * exposes `start()` / `startContinuable()`. Delegation now flows through a single
 * entry point, `startActivation(spec)`, where the child route lives on
 * `spec.request.agentOptions`. We therefore patch `startActivation` when it is
 * present and fall back to the legacy pair on older hosts.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type { AgentOptions } from '@deepseek-ai/dsh-agent'
// Module augmentation: declares `ctx.subagents` on Context. Must stay even
// though every legacy type import moved into local structural views.
import type {} from '@deepseek-ai/dsh-subagent'
import {
  ConfigSchema,
  MODEL_SWITCH_SETTINGS_NAMESPACE,
  resolveCustomSelection,
} from './config.ts'
import { resolveRuntimeConfig, type RuntimeConfig, type ModelSelectionConfig } from './shared.ts'
import { mergeAgentOptions } from './merge.ts'
import {
  effortFromSelection,
  installSessionLabelTracking,
  installSessionLabelsHttp,
  SessionLabelRegistry,
} from './session-labels.ts'

export {
  resolveCustomSelection,
  resolvePlanExecuteSelection,
} from './shared.ts'
export type { Config as ModelSwitchConfig } from './shared.ts'
export { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE }
export { SESSION_LABELS_ROUTE } from './label.ts'
export { formatModelLabel, formatContextWindow } from './label.ts'

/** Schemastery Config export expected by DSH plugin loaders. */
export const Config = ConfigSchema

export const name = 'model-switch'
export const inject = ['subagents']

/**
 * Minimal structural view of the delegation request the current DSH passes
 * through `startActivation({ request })`. Kept local so the patch compiles
 * against both the legacy and the current `dsh-subagent` typings.
 */
interface ActivationSpecLike {
  request: {
    agentOptions?: AgentOptions
    [key: string]: unknown
  }
  [key: string]: unknown
}

/** Structural view of the runtime we patch; every member is optional. */
interface SubagentRuntimeLike {
  start?: (providerName: string, request: unknown) => Promise<unknown>
  startContinuable?: (spec: unknown) => Promise<unknown>
  startActivation?: (spec: ActivationSpecLike) => Promise<unknown>
}

/** Patch agentOptions on a one-shot start request when custom selection is set. */
function withSubagentOptions(request: Record<string, unknown>, selection: ModelSelectionConfig): Record<string, unknown> {
  return {
    ...request,
    agentOptions: mergeAgentOptions(request.agentOptions as AgentOptions | undefined, selection),
  }
}

/** Patch agentOptions on a continuable start spec (legacy `startContinuable`). */
function withContinuableOptions(spec: Record<string, unknown>, selection: ModelSelectionConfig): Record<string, unknown> {
  const request = (spec.request ?? {}) as Record<string, unknown>
  return {
    ...spec,
    request: {
      ...request,
      agentOptions: mergeAgentOptions(request.agentOptions as AgentOptions | undefined, selection),
    },
  }
}

/** Patch agentOptions on a current-DSH activation spec. */
function withActivationOptions(spec: ActivationSpecLike, selection: ModelSelectionConfig): ActivationSpecLike {
  return {
    ...spec,
    request: {
      ...spec.request,
      agentOptions: mergeAgentOptions(spec.request.agentOptions, selection),
    },
  }
}

/**
 * Install settings + wrap subagent start paths.
 * @param ctx - host plugin context.
 * @param config - composition-entry defaults.
 */
export function apply(ctx: Context, config: RuntimeConfig = {}): void {
  const current = () => resolveRuntimeConfig(config)

  const labels = new SessionLabelRegistry()
  installSessionLabelsHttp(ctx, labels)
  installSessionLabelTracking(ctx, labels, () => (
    effortFromSelection(resolveCustomSelection(current().subagent))
  ))

  const runtime = ctx.subagents as unknown as SubagentRuntimeLike

  /** Resolve the configured child selection, warning when it is incomplete. */
  const selectionOf = (): ModelSelectionConfig | undefined => {
    const selection = resolveCustomSelection(current().subagent)
    if (selection === undefined && current().subagent?.mode === 'custom') {
      ctx.logger.warn('dsh-model-switch: subagent mode is custom but selection is incomplete; following parent')
    }
    return selection
  }

  ctx.effect(() => {
    // Current DSH: one activation entry point owns both local and external children.
    if (typeof runtime.startActivation === 'function') {
      // Keep the unbound original so disposal restores identity exactly; a
      // bound wrapper would accumulate one more layer on every HMR reload.
      const originalStartActivation = runtime.startActivation
      runtime.startActivation = async (spec: ActivationSpecLike) => {
        const selection = selectionOf()
        if (selection === undefined) return originalStartActivation.call(runtime, spec)
        return originalStartActivation.call(runtime, withActivationOptions(spec, selection))
      }
      return () => {
        runtime.startActivation = originalStartActivation
      }
    }

    // Legacy DSH: separate one-shot and continuable start paths.
    const originalStart = typeof runtime.start === 'function' ? runtime.start : undefined
    const originalStartContinuable = typeof runtime.startContinuable === 'function'
      ? runtime.startContinuable
      : undefined
    if (originalStart !== undefined) {
      runtime.start = async (providerName, request) => {
        const selection = selectionOf()
        if (selection === undefined) return originalStart.call(runtime, providerName, request)
        return originalStart.call(runtime, providerName, withSubagentOptions(request as Record<string, unknown>, selection))
      }
    }
    if (originalStartContinuable !== undefined) {
      runtime.startContinuable = async (spec) => {
        const selection = selectionOf()
        if (selection === undefined) return originalStartContinuable.call(runtime, spec)
        return originalStartContinuable.call(runtime, withContinuableOptions(spec as Record<string, unknown>, selection))
      }
    }
    return () => {
      if (originalStart !== undefined) runtime.start = originalStart
      if (originalStartContinuable !== undefined) runtime.startContinuable = originalStartContinuable
    }
  }, 'model-switch: wrap subagent start')
}
