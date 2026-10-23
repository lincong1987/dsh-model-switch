/**
 * Client mirror of the Host plugin Config namespace.
 *
 * DSH 0.2 exposes plugin Config values through the settings Remote. The
 * namespace is the Loader entry id (`model-switch` from cordis.patch.yml).
 */

import { MODEL_SWITCH_NS, type Config, type RouteSwitchConfig } from '../shared.ts'

export interface ConfigStoreSnapshot {
  status: 'loading' | 'ready' | 'error'
  value: Config
  error: string | null
  writable: boolean
}

const EMPTY: Config = {}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
type RemoteResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } }
type SettingsNamespaceView = { ns: string; value: JsonValue; revision: number }
type SettingsDescribeValue = { writable: boolean; namespaces: SettingsNamespaceView[] }

/** Narrow face verified from DSH 0.2 settingsController's Remote contract. */
export interface ConfigSettingsRemote {
  settings: {
    describe(): Promise<RemoteResult<SettingsDescribeValue>>
    update(
      ns: string,
      patch: Record<string, JsonValue>,
      expectedRevision: number | undefined,
    ): Promise<RemoteResult<SettingsNamespaceView>>
  }
}

/**
 * Strip own-properties whose value is `undefined` before the strict Remote codec.
 * For example, a route with `selection: undefined` is not valid JSON.
 */
function toJsonPatch(field: 'subagent' | 'planExecute', value: RouteSwitchConfig): Record<string, JsonValue> {
  return JSON.parse(JSON.stringify({ [field]: value })) as Record<string, JsonValue>
}

function errorMessage(error: { code: string; message: string }): string {
  return `${error.code}: ${error.message}`
}

/** Reactive, revision-fenced view of this plugin's Host Config entry. */
export class ConfigStore {
  private snap: ConfigStoreSnapshot = {
    status: 'loading',
    value: EMPTY,
    error: null,
    writable: false,
  }
  private revision: number | undefined
  private readGeneration = 0
  private writeTail: Promise<void> = Promise.resolve()
  private readonly listeners = new Set<() => void>()

  constructor(
    private readonly remote: ConfigSettingsRemote,
    private readonly namespace = MODEL_SWITCH_NS,
  ) {}

  getSnapshot = (): ConfigStoreSnapshot => this.snap

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  async refresh(): Promise<void> {
    const generation = ++this.readGeneration
    let result: RemoteResult<SettingsDescribeValue>
    try {
      result = await this.remote.settings.describe()
    } catch (cause: unknown) {
      if (generation !== this.readGeneration) return
      this.revision = undefined
      this.publish({
        ...this.snap,
        status: 'error',
        error: cause instanceof Error ? cause.message : String(cause),
        writable: false,
      })
      return
    }
    if (generation !== this.readGeneration) return

    if (!result.ok) {
      this.revision = undefined
      this.publish({
        ...this.snap,
        status: 'error',
        error: errorMessage(result.error),
        writable: false,
      })
      return
    }

    const entry = result.value.namespaces.find(row => row.ns === this.namespace)
    if (entry === undefined) {
      this.revision = undefined
      this.publish({
        ...this.snap,
        status: 'error',
        error: `settings namespace not found: ${this.namespace}`,
        writable: false,
      })
      return
    }

    this.revision = entry.revision
    this.publish({
      status: 'ready',
      value: entry.value as Config,
      error: null,
      writable: result.value.writable,
    })
  }

  /** Persist one route against the most recently observed revision. */
  saveRoute(field: 'subagent' | 'planExecute', next: RouteSwitchConfig): Promise<void> {
    const task = this.writeTail.then(() => this.persistRoute(field, next))
    this.writeTail = task.then(() => undefined, () => undefined)
    return task
  }

  private async persistRoute(field: 'subagent' | 'planExecute', next: RouteSwitchConfig): Promise<void> {
    if (this.snap.status !== 'ready' || this.revision === undefined) {
      throw new Error(this.snap.error ?? 'settings are not loaded')
    }
    if (!this.snap.writable) throw new Error('host settings are read-only')

    const result = await this.remote.settings.update(
      this.namespace,
      toJsonPatch(field, next),
      this.revision,
    )
    if (!result.ok) {
      await this.refresh()
      throw new Error(errorMessage(result.error))
    }

    this.revision = result.value.revision
    this.publish({
      status: 'ready',
      value: result.value.value as Config,
      error: null,
      writable: this.snap.writable,
    })
  }

  private publish(next: ConfigStoreSnapshot): void {
    this.snap = next
    for (const listener of this.listeners) listener()
  }
}

export type { Config }
