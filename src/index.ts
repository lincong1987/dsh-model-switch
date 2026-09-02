/**
 * Host half of dsh-model-switch: persist settings and inject subagent model routes.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type {
  ContinuableStartSpec,
  SubagentStartRequest,
  SubagentRuntime,
} from '@deepseek-ai/dsh-subagent'
import type {} from '@deepseek-ai/dsh-subagent'
import type {} from '@deepseek-ai/dsh-settings'
import {
  ConfigSchema,
  MODEL_SWITCH_SETTINGS_NAMESPACE,
  resolveCustomSelection,
} from './config.ts'
import type { Config as ModelSwitchConfig } from './shared.ts'
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

/** Patch agentOptions on a one-shot start request when custom selection is set. */
function withSubagentOptions(
  request: SubagentStartRequest,
  selection: NonNullable<ReturnType<typeof resolveCustomSelection>>,
): SubagentStartRequest {
  return {
    ...request,
    agentOptions: mergeAgentOptions(request.agentOptions, selection),
  }
}

/** Patch agentOptions on a continuable start spec. */
function withContinuableOptions(
  spec: ContinuableStartSpec,
  selection: NonNullable<ReturnType<typeof resolveCustomSelection>>,
): ContinuableStartSpec {
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
export function apply(ctx: Context, config: ModelSwitchConfig = {}): void {
  let current: () => ModelSwitchConfig = () => config

  // The settings provider is optional: attach the namespace while a provider
  // is present and keep falling back to the composition entry otherwise.
  // `ctx.settings` is only reachable on a context that injected the service.
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.installSection(ctx, MODEL_SWITCH_SETTINGS_NAMESPACE, ConfigSchema, config, {
      setSource: (source) => { current = source },
      onChange: () => { /* live reads via current() */ },
    })
  })

  const labels = new SessionLabelRegistry()
  installSessionLabelsHttp(ctx, labels)
  installSessionLabelTracking(ctx, labels, () => (
    effortFromSelection(resolveCustomSelection(current().subagent))
  ))

  const runtime = ctx.subagents as SubagentRuntime
  const originalStart = runtime.start.bind(runtime)
  const originalStartContinuable = runtime.startContinuable.bind(runtime)

  ctx.effect(() => {
    runtime.start = async (providerName, request) => {
      const selection = resolveCustomSelection(current().subagent)
      if (selection === undefined) {
        if (current().subagent?.mode === 'custom') {
          ctx.logger.warn('dsh-model-switch: subagent mode is custom but selection is incomplete; following parent')
        }
        return originalStart(providerName, request)
      }
      return originalStart(providerName, withSubagentOptions(request, selection))
    }

    runtime.startContinuable = async (spec) => {
      const selection = resolveCustomSelection(current().subagent)
      if (selection === undefined) {
        if (current().subagent?.mode === 'custom') {
          ctx.logger.warn('dsh-model-switch: subagent mode is custom but selection is incomplete; following parent')
        }
        return originalStartContinuable(spec)
      }
      return originalStartContinuable(withContinuableOptions(spec, selection))
    }

    return () => {
      runtime.start = originalStart
      runtime.startContinuable = originalStartContinuable
    }
  }, 'model-switch: wrap subagent start')
}
