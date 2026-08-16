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
import { installSettingsSection } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-settings'
import {
  ConfigSchema,
  MODEL_SWITCH_SETTINGS_NAMESPACE,
  resolveCustomSelection,
} from './config.ts'
import { installConfigHttp } from './config-http.ts'
import type { Config as ModelSwitchConfig } from './shared.ts'
import { mergeAgentOptions } from './merge.ts'

export {
  resolveCustomSelection,
  resolvePlanExecuteSelection,
} from './shared.ts'
export type { Config as ModelSwitchConfig } from './shared.ts'
export { ConfigSchema, MODEL_SWITCH_SETTINGS_NAMESPACE }
export { CONFIG_ROUTE } from './config-http.ts'

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
 * Install settings + wrap subagent start paths + optional child effort injection.
 * @param ctx - host plugin context.
 * @param config - composition-entry defaults.
 */
export function apply(ctx: Context, config: ModelSwitchConfig = {}): void {
  let current: () => ModelSwitchConfig = () => config

  installSettingsSection(ctx, MODEL_SWITCH_SETTINGS_NAMESPACE, ConfigSchema, config, {
    setSource: (source) => { current = source },
    onChange: () => { /* live reads via current() */ },
  })

  // Web clients cannot mutate third-party namespaces through settings.*; expose
  // a same-origin HTTP surface that writes the host-registered section.
  installConfigHttp(ctx, () => current(), async (next) => {
    const settings = ctx.get('settings')
    if (settings === undefined) throw new Error('settings service unavailable')
    await settings.replace(MODEL_SWITCH_SETTINGS_NAMESPACE, next)
    return current()
  })

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

  // Reasoning effort is not part of AgentOptions; inject on child agent/request.
  ctx.on('agent/created', ({ agent }) => {
    if (agent.session.header.origin !== 'subagent') return
    const selection = resolveCustomSelection(current().subagent)
    const effort = selection?.reasoningEffort
    if (effort === undefined || effort.length === 0) return
    agent.ctx.on('agent/request', async (_payload, next) => {
      const seed = await next()
      return Object.assign({}, seed, { reasoningEffort: effort })
    })
  })
}
