import { describe, expect, it } from 'vitest'
import { ConfigStore, type ConfigSettingsRemote } from '../src/client/config-store.ts'
import type { Config, RouteSwitchConfig } from '../src/shared.ts'

type NamespaceView = { ns: string; value: Config; revision: number }
type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

interface MockSettingsRemote extends ConfigSettingsRemote {
  calls: Array<{ method: 'describe' | 'update'; args: unknown[] }>
  setWritable(value: boolean): void
  setNamespace(value: string | undefined): void
  setDescribeFailure(message: string | undefined): void
  publish(value: Config): void
}

function mockRemote(initial: Config = {}): MockSettingsRemote {
  let value = initial
  let revision = 1
  let writable = true
  let namespace: string | undefined = 'model-switch'
  let describeFailure: string | undefined
  const calls: MockSettingsRemote['calls'] = []
  return {
    calls,
    setWritable(next) { writable = next },
    setNamespace(next) { namespace = next },
    setDescribeFailure(next) { describeFailure = next },
    publish(next) { value = next; revision += 1 },
    settings: {
      async describe() {
        calls.push({ method: 'describe', args: [] })
        if (describeFailure !== undefined) throw new Error(describeFailure)
        return {
          ok: true as const,
          value: {
            writable,
            hasDocument: true,
            namespaces: namespace === undefined ? [] : [{ ns: namespace, value, revision }],
          },
        }
      },
      async update(ns: string, patch: Record<string, JsonValue>, expectedRevision: number | undefined) {
        calls.push({ method: 'update', args: [ns, patch, expectedRevision] })
        if (expectedRevision !== revision) {
          return { ok: false as const, error: { code: 'settings/conflict', message: 'stale revision' } }
        }
        value = { ...value, ...patch } as Config
        revision += 1
        return {
          ok: true as const,
          value: { ns, value, revision, autoGenerate: false, schema: {}, applies: 'live' as const, secrets: [] },
        }
      },
    },
  } as unknown as MockSettingsRemote
}

const customRoute: RouteSwitchConfig = {
  mode: 'custom',
  selection: { provider: 'provider-a', model: 'model-a' },
}

describe('ConfigStore', () => {
  it('loads the plugin entry by namespace and retains its writable revision', async () => {
    const remote = mockRemote({ subagent: { mode: 'follow-main' } })
    const store = new ConfigStore(remote)
    await store.refresh()
    expect(remote.calls).toEqual([{ method: 'describe', args: [] }])
    expect(store.getSnapshot()).toEqual({
      status: 'ready',
      value: { subagent: { mode: 'follow-main' } },
      error: null,
      writable: true,
    })
  })

  it('writes a single route field with the namespace and current revision', async () => {
    const remote = mockRemote({ planExecute: { mode: 'follow-main' } })
    const store = new ConfigStore(remote)
    await store.refresh()
    await store.saveRoute('subagent', customRoute)

    expect(remote.calls[1]).toEqual({
      method: 'update',
      args: ['model-switch', { subagent: customRoute }, 1],
    })
    expect(store.getSnapshot().value).toEqual({
      planExecute: { mode: 'follow-main' },
      subagent: customRoute,
    })
  })

  it('removes explicit undefined values before the strict JSON Remote codec', async () => {
    const remote = mockRemote()
    const store = new ConfigStore(remote)
    await store.refresh()
    await store.saveRoute('subagent', { mode: 'follow-main', selection: undefined })
    expect(remote.calls[1]).toEqual({
      method: 'update',
      args: ['model-switch', { subagent: { mode: 'follow-main' } }, 1],
    })
  })

  it('rejects writes while host settings are read-only', async () => {
    const remote = mockRemote()
    remote.setWritable(false)
    const store = new ConfigStore(remote)
    await store.refresh()
    await expect(store.saveRoute('subagent', customRoute)).rejects.toThrow('host settings are read-only')
    expect(remote.calls).toEqual([{ method: 'describe', args: [] }])
  })

  it('clears writable state when a refreshed describe request rejects', async () => {
    const remote = mockRemote({ subagent: { mode: 'follow-main' } })
    const store = new ConfigStore(remote)
    await store.refresh()
    expect(store.getSnapshot().writable).toBe(true)

    remote.setDescribeFailure('connection reset')
    await store.refresh()
    expect(store.getSnapshot()).toEqual({
      status: 'error',
      value: { subagent: { mode: 'follow-main' } },
      error: 'connection reset',
      writable: false,
    })
    await expect(store.saveRoute('subagent', customRoute)).rejects.toThrow('connection reset')
  })

  it('maps a missing plugin Config namespace to an explicit error', async () => {
    const remote = mockRemote()
    remote.setNamespace(undefined)
    const store = new ConfigStore(remote)
    await store.refresh()
    expect(store.getSnapshot()).toEqual({
      status: 'error',
      value: {},
      error: 'settings namespace not found: model-switch',
      writable: false,
    })
  })

  it('notifies subscribers when a refreshed namespace changes', async () => {
    const remote = mockRemote({ subagent: { mode: 'follow-main' } })
    const store = new ConfigStore(remote)
    await store.refresh()
    let ticks = 0
    const stop = store.subscribe(() => { ticks += 1 })
    remote.publish({ subagent: customRoute })
    await store.refresh()
    expect(ticks).toBe(1)
    expect(store.getSnapshot().value.subagent).toEqual(customRoute)
    stop()
  })
})
