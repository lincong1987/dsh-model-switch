/**
 * Settings section: 模型切换 — subagent + plan-execute routes.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { Config, ModelSelectionConfig, RouteSwitchConfig } from '../shared.ts'
import { ConfigStore } from './config-store.ts'
import { ModelPicker } from './ModelPicker.tsx'
import type { LocaleKey } from './locales.ts'
import css from './styles.module.css'

export interface SettingsInjected {
  store: ConfigStore
  api: ConnectionHandle['api']
  currentSessionId: () => SessionId | undefined
  t: (key: LocaleKey) => string
}

export type SettingsSectionProps = PropsRuntime<'settings.section'> & Partial<SettingsInjected>

function RouteBlock(props: {
  field: 'subagent' | 'planExecute'
  title: string
  hint: string
  route: RouteSwitchConfig
  onChange: (next: RouteSwitchConfig) => void
  sessionId: SessionId | undefined
  api: ConnectionHandle['api']
  t: (key: LocaleKey) => string
  busy: boolean
}) {
  const { field, title, hint, route, onChange, sessionId, api, t, busy } = props
  return (
    <section className={css.block}>
      <h3 className={css.blockTitle}>{title}</h3>
      <p className={css.hint}>{hint}</p>
      <div className={css.modes} role="radiogroup" aria-label={title}>
        <label className={css.mode}>
          <input
            type="radio"
            name={`model-switch-${field}`}
            checked={route.mode !== 'custom'}
            disabled={busy}
            onChange={() => { onChange({ mode: 'follow-main', selection: route.selection }) }}
          />
          {t('modeFollow')}
        </label>
        <label className={css.mode}>
          <input
            type="radio"
            name={`model-switch-${field}`}
            checked={route.mode === 'custom'}
            disabled={busy}
            onChange={() => { onChange({ mode: 'custom', selection: route.selection }) }}
          />
          {t('modeCustom')}
        </label>
      </div>
      {route.mode === 'custom' ? (
        <ModelPicker
          sessionId={sessionId}
          api={api}
          value={route.selection}
          disabled={busy}
          t={t}
          onChange={(selection: ModelSelectionConfig) => {
            onChange({ mode: 'custom', selection })
          }}
        />
      ) : null}
    </section>
  )
}

export function SettingsSection(props: SettingsSectionProps) {
  const { store, api, currentSessionId, t } = props
  if (store === undefined || api === undefined || currentSessionId === undefined || t === undefined) {
    return null
  }

  const snap = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
  )
  const value = snap.value
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<SessionId | undefined>(currentSessionId())

  useEffect(() => {
    void store.load()
  }, [store])

  useEffect(() => {
    const tick = (): void => { setSessionId(currentSessionId()) }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => { window.clearInterval(id) }
  }, [currentSessionId])

  const subagent: RouteSwitchConfig = useMemo(
    () => value.subagent ?? { mode: 'follow-main' },
    [value.subagent],
  )
  const planExecute: RouteSwitchConfig = useMemo(
    () => value.planExecute ?? { mode: 'follow-main' },
    [value.planExecute],
  )

  const writeRoute = (field: 'subagent' | 'planExecute', next: RouteSwitchConfig): void => {
    setBusy(true)
    setError(null)
    const payload: Config = { ...value, [field]: next }
    void store.save(payload).then(() => {
      setBusy(false)
    }).catch((cause: unknown) => {
      setBusy(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    })
  }

  return (
    <div className={css.section}>
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{t('title')}</h2>
      <p className={css.intro}>{t('intro')}</p>
      {error !== null || snap.error !== null
        ? <p className={css.error}>{t('saveError')}: {error ?? snap.error}</p>
        : null}
      <RouteBlock
        field="subagent"
        title={t('subagentTitle')}
        hint={t('subagentHint')}
        route={subagent}
        sessionId={sessionId}
        api={api}
        t={t}
        busy={busy || snap.status === 'loading'}
        onChange={(next) => { writeRoute('subagent', next) }}
      />
      <RouteBlock
        field="planExecute"
        title={t('planTitle')}
        hint={t('planHint')}
        route={planExecute}
        sessionId={sessionId}
        api={api}
        t={t}
        busy={busy || snap.status === 'loading'}
        onChange={(next) => { writeRoute('planExecute', next) }}
      />
    </div>
  )
}
