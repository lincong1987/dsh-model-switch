/**
 * Settings section: 模型切换 — subagent + plan-execute routes.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelSelectionConfig, RouteSwitchConfig } from '../shared.ts'
import { ConfigStore } from './config-store.ts'
import { IconModelSwitch } from './IconModelSwitch.tsx'
import { ModelPicker, type ModelCatalogAccess } from './ModelPicker.tsx'
import type { LocaleKey } from './locales.ts'
import css from './styles.module.css'

export interface SettingsInjected {
  store: ConfigStore
  access: ModelCatalogAccess
  currentSessionId: () => SessionId | undefined
  t: (key: LocaleKey) => string
}

export type SettingsSectionProps = PropsRuntime<'settings.section'> & Partial<SettingsInjected>

function RouteBlock(props: {
  title: string
  hint: string
  route: RouteSwitchConfig
  onChange: (next: RouteSwitchConfig) => void
  sessionId: SessionId | undefined
  access: ModelCatalogAccess
  t: (key: LocaleKey) => string
  busy: boolean
}) {
  const { title, hint, route, onChange, sessionId, access, t, busy } = props
  const follow = route.mode !== 'custom'
  return (
    <section className={css.block}>
      <h3 className={css.blockTitle}>{title}</h3>
      <p className={css.hint}>{hint}</p>
      <div className={css.modes} role="radiogroup" aria-label={title}>
        <button
          type="button"
          role="radio"
          aria-checked={follow}
          className={[css.mode, follow ? css.modeActive : ''].filter(Boolean).join(' ')}
          disabled={busy}
          onClick={() => { onChange({ mode: 'follow-main', selection: route.selection }) }}
        >
          {t('modeFollow')}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!follow}
          className={[css.mode, !follow ? css.modeActive : ''].filter(Boolean).join(' ')}
          disabled={busy}
          onClick={() => { onChange({ mode: 'custom', selection: route.selection }) }}
        >
          {t('modeCustom')}
        </button>
      </div>
      {route.mode === 'custom' ? (
        <div className={css.pickerWrap}>
          <ModelPicker
            sessionId={sessionId}
            access={access}
            value={route.selection}
            disabled={busy}
            t={t}
            placement="bottom"
            onChange={(selection: ModelSelectionConfig) => {
              onChange({ mode: 'custom', selection })
            }}
          />
        </div>
      ) : null}
    </section>
  )
}

export function SettingsSection(props: SettingsSectionProps) {
  const { store, access, currentSessionId, t } = props
  if (store === undefined || access === undefined || currentSessionId === undefined || t === undefined) {
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
    void store.saveRoute(field, next).then(() => {
      setBusy(false)
    }).catch((cause: unknown) => {
      setBusy(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    })
  }

  return (
    <div className={css.section}>
      <div className={css.titleRow}>
        <IconModelSwitch className={css.titleIcon} size={18} />
        <h2 className={css.title}>{t('title')}</h2>
      </div>
      <p className={css.intro}>{t('intro')}</p>
      {error !== null || snap.error !== null
        ? (
          <p className={css.error}>
            {t('saveError')}: {snap.error === 'unavailable' ? t('unavailable') : (error ?? snap.error)}
          </p>
        )
        : null}
      <RouteBlock
        title={t('subagentTitle')}
        hint={t('subagentHint')}
        route={subagent}
        sessionId={sessionId}
        access={access}
        t={t}
        busy={busy || snap.status === 'loading'}
        onChange={(next) => { writeRoute('subagent', next) }}
      />
      <RouteBlock
        title={t('planTitle')}
        hint={t('planHint')}
        route={planExecute}
        sessionId={sessionId}
        access={access}
        t={t}
        busy={busy || snap.status === 'loading'}
        onChange={(next) => { writeRoute('planExecute', next) }}
      />
    </div>
  )
}
