/**
 * Browser mirror of the host `model-switch` settings namespace.
 *
 * DSH 0.1.1-rc.2 serves plugin-registered namespaces through settings.*;
 * this store is a stable snapshot wrapper over `ctx.settingsScope`.
 */

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { Config, RouteSwitchConfig } from '../shared.ts'

export interface ConfigStoreSnapshot {
  status: 'loading' | 'ready' | 'error'
  value: Config
  error: string | null
}

const EMPTY: Config = {}

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
    await this.scope.set(field, next)
    const snap = this.getSnapshot()
    if (snap.status === 'error') {
      throw new Error(snap.error ?? 'unavailable')
    }
  }
}
