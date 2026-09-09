/**
 * Browser mirror of the host `model-switch` settings namespace.
 *
 * DSH 0.1.2-alpha.4+ serves plugin-registered namespaces through settings.*;
 * this store is a stable snapshot wrapper over `ctx.settingsScope`.
 */

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Config, RouteSwitchConfig } from '../shared.ts'

export interface ConfigStoreSnapshot {
  status: 'loading' | 'ready' | 'error'
  value: Config
  error: string | null
}

const EMPTY: Config = {}

/**
 * Strip own-properties whose value is `undefined`.
 *
 * The `settings/mutate` strict JSON codec rejects ops whose `value` contains
 * explicit `undefined` members (e.g. `{ mode: 'follow-main', selection:
 * undefined }` produced by the settings UI), failing with
 * `client api:settings/mutate rejected "ops"`. A JSON round-trip drops them.
 */
function toJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function view(snap: SettingsScopeSnapshot<Config>): ConfigStoreSnapshot {
  if (snap.status === 'unavailable') {
    return { status: 'error', value: snap.value ?? EMPTY, error: 'unavailable' }
  }
  if (snap.status === 'loading' && snap.value === undefined) {
    return { status: 'loading', value: EMPTY, error: null }
  }
  return { status: 'ready', value: snap.value ?? EMPTY, error: null }
}

/** Reactive config store over the client settings-namespace scope. */
export class ConfigStore {
  private lastRaw: SettingsScopeSnapshot<Config> | undefined
  private lastView: ConfigStoreSnapshot = { status: 'loading', value: EMPTY, error: null }

  constructor(private readonly scope: SettingsScope<Config>) {}

  getSnapshot(): ConfigStoreSnapshot {
    const raw = this.scope.getSnapshot()
    if (raw === this.lastRaw) return this.lastView
    this.lastRaw = raw
    this.lastView = view(raw)
    return this.lastView
  }

  subscribe(listener: () => void): () => void {
    return this.scope.subscribe(listener)
  }

  /**
   * Persist one route field. `settingsScope.set` is one field per call and
   * fences the write with the latest known namespace revision.
   */
  async saveRoute(field: 'subagent' | 'planExecute', next: RouteSwitchConfig): Promise<void> {
    await this.scope.set(field, toJsonValue(next))
    const snap = this.getSnapshot()
    if (snap.status === 'error') {
      throw new Error(snap.error ?? 'unavailable')
    }
  }
}
