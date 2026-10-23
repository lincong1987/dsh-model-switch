import { describe, expect, it } from 'vitest'
import { ConfigSchema } from '../src/config.ts'
import { resolveRuntimeConfig, type RouteSwitchConfig, type RuntimeConfig } from '../src/shared.ts'

describe('volatile plugin Config', () => {
  it('marks each editable route as a live DSH settings field', () => {
    const schema = ConfigSchema as unknown as {
      dict: Record<string, { meta: { volatile?: boolean } }>
    }
    expect(schema.dict.subagent.meta.volatile).toBe(true)
    expect(schema.dict.planExecute.meta.volatile).toBe(true)
  })

  it('unwraps Schemastery live references before routing decisions', () => {
    const subagent: RouteSwitchConfig = {
      mode: 'custom',
      selection: { provider: 'provider-a', model: 'model-a' },
    }
    const planExecute: RouteSwitchConfig = { mode: 'follow-main' }
    const parsed = ConfigSchema({ subagent, planExecute })

    expect(resolveRuntimeConfig(parsed as unknown as RuntimeConfig)).toEqual({
      subagent,
      planExecute,
    })
  })

  it('keeps default routes readable through volatile references', () => {
    const parsed = ConfigSchema({})
    expect(resolveRuntimeConfig(parsed as unknown as RuntimeConfig)).toEqual({
      subagent: { mode: 'follow-main' },
      planExecute: { mode: 'follow-main' },
    })
  })
})
