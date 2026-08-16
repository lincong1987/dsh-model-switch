/**
 * Browser client for the host config HTTP surface.
 */

import type { Config } from '../shared.ts'

/** Must match host `CONFIG_ROUTE`. */
export const CONFIG_ROUTE = '/_dsh/model-switch/config'

export interface ConfigStoreSnapshot {
  status: 'loading' | 'ready' | 'error'
  value: Config
  error: string | null
}

type Listener = () => void

/** Simple reactive config store over same-origin HTTP. */
export class ConfigStore {
  private snapshot: ConfigStoreSnapshot = {
    status: 'loading',
    value: {},
    error: null,
  }
  private listeners = new Set<Listener>()

  getSnapshot(): ConfigStoreSnapshot {
    return this.snapshot
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private publish(next: ConfigStoreSnapshot): void {
    this.snapshot = next
    for (const listener of this.listeners) listener()
  }

  async load(): Promise<void> {
    this.publish({ ...this.snapshot, status: 'loading', error: null })
    try {
      const response = await fetch(CONFIG_ROUTE, { credentials: 'same-origin' })
      const body = await response.json() as { ok: boolean; value?: Config; error?: { message: string } }
      if (!response.ok || !body.ok || body.value === undefined) {
        throw new Error(body.error?.message ?? `HTTP ${response.status}`)
      }
      this.publish({ status: 'ready', value: body.value, error: null })
    } catch (error: unknown) {
      this.publish({
        status: 'error',
        value: this.snapshot.value,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  async save(next: Config): Promise<void> {
    this.publish({ ...this.snapshot, status: 'loading', error: null })
    try {
      const response = await fetch(CONFIG_ROUTE, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: next }),
      })
      const body = await response.json() as { ok: boolean; value?: Config; error?: { message: string } }
      if (!response.ok || !body.ok || body.value === undefined) {
        throw new Error(body.error?.message ?? `HTTP ${response.status}`)
      }
      this.publish({ status: 'ready', value: body.value, error: null })
    } catch (error: unknown) {
      this.publish({
        status: 'error',
        value: this.snapshot.value,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
