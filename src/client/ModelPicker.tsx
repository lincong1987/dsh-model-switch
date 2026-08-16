/**
 * Compact model catalog picker (settings + plan panel). Loads via session.models.
 */

import { useEffect, useMemo, useState } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelSelection, SessionModels } from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ModelSelectionConfig } from '../shared.ts'
import type { LocaleKey } from './locales.ts'
import css from './styles.module.css'

export interface ModelPickerProps {
  sessionId: SessionId | undefined
  api: ConnectionHandle['api']
  value: ModelSelectionConfig | undefined
  onChange: (next: ModelSelectionConfig) => void
  t: (key: LocaleKey) => string
  disabled?: boolean
  className?: string
}

function sameSelection(a: ModelSelectionConfig | undefined, b: ModelSelection): boolean {
  return a?.provider === b.provider
    && a.model === b.model
    && (a.reasoningEffort ?? undefined) === (b.reasoningEffort ?? undefined)
}

export function ModelPicker({
  sessionId, api, value, onChange, t, disabled, className,
}: ModelPickerProps) {
  const [catalog, setCatalog] = useState<SessionModels | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionId === undefined) {
      setCatalog(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void api.sessions.models({ sessionId }).then(({ result }) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(`${result.error.code}: ${result.error.message}`)
        return
      }
      setCatalog(result.value)
      if (value === undefined) {
        const current = result.value.current
        if (current.provider && current.model) {
          onChange({
            provider: current.provider,
            model: current.model,
            ...current.reasoningEffort === undefined ? {} : { reasoningEffort: current.reasoningEffort },
          })
        }
      }
    }).catch((cause: unknown) => {
      if (cancelled) return
      setLoading(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    })
    return () => { cancelled = true }
  // Intentionally omit value/onChange: mount/session drives catalog load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, api])

  const choices = useMemo(() => {
    if (catalog === null) return []
    return catalog.groups.flatMap(group => group.models.map(model => ({
      provider: group.id,
      providerName: group.name,
      model: model.id,
      modelName: model.name,
      reasoning: model.reasoning,
    })))
  }, [catalog])

  const selected = choices.find(c => c.provider === value?.provider && c.model === value?.model)
  const efforts = selected?.reasoning?.efforts ?? []

  if (sessionId === undefined) {
    return <p className={css.muted}>{t('noSession')}</p>
  }

  return (
    <div className={[css.picker, className].filter(Boolean).join(' ')}>
      {error !== null ? <p className={css.error}>{t('loadError')}: {error}</p> : null}
      <label className={css.row}>
        <span className={css.label}>{t('modelLabel')}</span>
        <select
          className={css.select}
          disabled={disabled || loading || choices.length === 0}
          value={selected ? `${selected.provider}\0${selected.model}` : ''}
          onChange={(event) => {
            const [provider, model] = event.target.value.split('\0')
            if (!provider || !model) return
            const row = choices.find(c => c.provider === provider && c.model === model)
            const defaultEffort = row?.reasoning?.defaultEffort
            onChange({
              provider,
              model,
              ...defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort },
            })
          }}
        >
          {choices.length === 0
            ? <option value="">{loading ? '…' : '—'}</option>
            : choices.map(c => (
              <option key={`${c.provider}/${c.model}`} value={`${c.provider}\0${c.model}`}>
                {c.providerName} / {c.modelName}
              </option>
            ))}
        </select>
      </label>
      {efforts.length > 0 ? (
        <label className={css.row}>
          <span className={css.label}>{t('effortLabel')}</span>
          <select
            className={css.select}
            disabled={disabled || loading}
            value={value?.reasoningEffort ?? ''}
            onChange={(event) => {
              if (value === undefined) return
              const effort = event.target.value
              onChange({
                provider: value.provider,
                model: value.model,
                ...effort.length === 0 ? {} : { reasoningEffort: effort },
              })
            }}
          >
            {selected?.reasoning?.defaultEffort === undefined
              ? <option value="">{t('effortDefault')}</option>
              : null}
            {efforts.map(effort => (
              <option key={effort.id} value={effort.id}>{effort.name}</option>
            ))}
          </select>
        </label>
      ) : null}
      {catalog !== null && value !== undefined && !sameSelection(value, catalog.current)
        ? null
        : null}
    </div>
  )
}
