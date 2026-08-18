import { describe, expect, it } from 'vitest'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import { ConfigStore } from '../src/client/config-store.ts'
import type { Config } from '../src/shared.ts'

function mockScope(initial: SettingsScopeSnapshot<Config>): SettingsScope<Config> & {
  publish(next: SettingsScopeSnapshot<Config>): void
} {
  let snap = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => snap,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    async set(field, value) {
      snap = {
        ...snap,
        status: 'ready',
        value: { ...snap.value, [field]: value },
        user: { ...(snap.user as object | undefined), [field]: value },
        revision: (snap.revision ?? 0) + 1,
        writable: true,
      }
      for (const listener of listeners) listener()
    },
    async unset(field) {
      const nextValue = { ...snap.value }
      delete nextValue[field as keyof Config]
      snap = {
        ...snap,
        status: 'ready',
        value: nextValue,
        revision: (snap.revision ?? 0) + 1,
        writable: true,
      }
      for (const listener of listeners) listener()
    },
    publish(next) {
      snap = next
      for (const listener of listeners) listener()
    },
  }
}

const loading: SettingsScopeSnapshot<Config> = {
  status: 'loading',
  value: undefined,
  base: undefined,
  user: undefined,
  revision: undefined,
  writable: false,
  mode: 'host',
}

describe('ConfigStore', () => {
  it('maps loading with no value to loading', () => {
    const store = new ConfigStore(mockScope(loading))
    expect(store.getSnapshot()).toEqual({ status: 'loading', value: {}, error: null })
  })

  it('reuses the mapped snapshot while the raw snapshot is unchanged', () => {
    const store = new ConfigStore(mockScope(loading))
    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })

  it('maps unavailable to error', () => {
    const store = new ConfigStore(mockScope({ ...loading, status: 'unavailable' }))
    expect(store.getSnapshot()).toEqual({
      status: 'error',
      value: {},
      error: 'unavailable',
    })
  })

  it('writes one route field through the scope', async () => {
    const scope = mockScope({
      ...loading,
      status: 'ready',
      value: { subagent: { mode: 'follow-main' }, planExecute: { mode: 'follow-main' } },
      revision: 1,
      writable: true,
    })
    const store = new ConfigStore(scope)
    await store.saveRoute('subagent', {
      mode: 'custom',
      selection: { provider: 'p', model: 'm' },
    })
    expect(store.getSnapshot().value.subagent).toEqual({
      mode: 'custom',
      selection: { provider: 'p', model: 'm' },
    })
    expect(store.getSnapshot().value.planExecute).toEqual({ mode: 'follow-main' })
  })

  it('notifies subscribers when the scope snapshot changes', () => {
    const scope = mockScope(loading)
    const store = new ConfigStore(scope)
    let ticks = 0
    const stop = store.subscribe(() => { ticks += 1 })
    scope.publish({
      ...loading,
      status: 'ready',
      value: { subagent: { mode: 'follow-main' } },
      revision: 1,
      writable: true,
    })
    expect(ticks).toBe(1)
    expect(store.getSnapshot().status).toBe('ready')
    stop()
  })
})
