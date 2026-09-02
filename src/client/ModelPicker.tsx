/**
 * Compact model catalog picker (settings + plan panel).
 * Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
 */

import {
  useEffect, useId, useMemo, useRef, useState,
  type FocusEvent, type KeyboardEvent,
} from 'react'
import type { ModelCatalog, ModelSelection, SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import {
  IconCheckOutline16,
  IconChevronDownOutline14,
  IconChevronRightOutline14,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ModelSelectionConfig } from '../shared.ts'
import type { LocaleKey } from './locales.ts'
import css from './ModelPicker.module.css'

/** Catalog + current-selection access supplied by the plugin entry. */
export interface ModelCatalogAccess {
  /** Load the deployment model catalog; rejects with a readable error. */
  loadCatalog: () => Promise<ModelCatalog>
  /** The session's durable selection (`next` over `lastUsed`), if any. */
  currentSelection: (sessionId: SessionId) => ModelSelection | undefined
}

export interface ModelPickerProps {
  sessionId: SessionId | undefined
  access: ModelCatalogAccess
  value: ModelSelectionConfig | undefined
  onChange: (next: ModelSelectionConfig) => void
  t: (key: LocaleKey) => string
  disabled?: boolean
  className?: string
  /** Menu opens above (composer/plan) or below (settings). */
  placement?: 'top' | 'bottom'
}

type Pane = 'root' | 'model' | 'effort'

interface EffortChoice {
  key: string
  effort: string | undefined
  label: string
  description?: string
}

export function ModelPicker({
  sessionId, access, value, onChange, t, disabled, className,
  placement = 'bottom',
}: ModelPickerProps) {
  const [catalog, setCatalog] = useState<ModelCatalog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [pane, setPane] = useState<Pane>('root')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const id = useId()

  valueRef.current = value
  onChangeRef.current = onChange

  const seedFromCurrent = (current: ModelSelection | undefined): void => {
    if (valueRef.current !== undefined) return
    if (current === undefined || !current.provider || !current.model) return
    onChangeRef.current({
      provider: current.provider,
      model: current.model,
      ...current.reasoningEffort === undefined ? {} : { reasoningEffort: current.reasoningEffort },
    })
  }

  const load = (): void => {
    if (sessionId === undefined) {
      setCatalog(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    void access.loadCatalog().then((next) => {
      setCatalog(next)
      seedFromCurrent(access.currentSelection(sessionId) ?? next.default)
    }).catch((cause: unknown) => {
      setLoading(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    })
  }

  useEffect(() => {
    let cancelled = false
    if (sessionId === undefined) {
      setCatalog(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    void access.loadCatalog().then((next) => {
      if (cancelled) return
      setLoading(false)
      setCatalog(next)
      seedFromCurrent(access.currentSelection(sessionId) ?? next.default)
    }).catch((cause: unknown) => {
      if (cancelled) return
      setLoading(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    })
    return () => { cancelled = true }
  }, [sessionId, access])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setPane('root')
      }
    }
    document.addEventListener('mousedown', closeOutside)
    return () => { document.removeEventListener('mousedown', closeOutside) }
  }, [open])

  const choices = useMemo(() => {
    if (catalog === null) return []
    return catalog.groups.flatMap(group => group.models.map(model => ({
      provider: group.id,
      providerName: group.name,
      model: model.id,
      modelName: model.name,
      description: model.description,
      reasoning: model.reasoning,
    })))
  }, [catalog])

  const groups = catalog?.groups ?? []
  const selected = choices.find(c => c.provider === value?.provider && c.model === value?.model)
  const reasoning = selected?.reasoning
  const effectiveEffort = value?.reasoningEffort ?? reasoning?.defaultEffort
  const effortLabel = reasoning === undefined
    ? undefined
    : effectiveEffort === undefined
      ? t('effortDefault')
      : reasoning.efforts.find(level => level.id === effectiveEffort)?.name ?? effectiveEffort

  const effortChoices = useMemo<readonly EffortChoice[]>(() => {
    if (reasoning === undefined) return []
    return [
      ...reasoning.defaultEffort === undefined
        ? [{ key: 'provider-default', effort: undefined, label: t('effortDefault') }]
        : [],
      ...reasoning.efforts.map(effort => ({
        key: `effort:${effort.id}`,
        effort: effort.id,
        label: effort.name,
        ...effort.description === undefined ? {} : { description: effort.description },
      })),
    ]
  }, [reasoning, t])

  const close = (restoreFocus = false): void => {
    setOpen(false)
    setPane('root')
    if (restoreFocus) queueMicrotask(() => { triggerRef.current?.focus() })
  }

  const show = (): void => {
    setPane('root')
    setOpen(true)
    load()
  }

  const moveFocus = (offset: number): void => {
    const items = itemRefs.current.filter(item => item !== null)
    if (items.length === 0) return
    const active = items.findIndex(item => item === document.activeElement)
    const next = (Math.max(active, 0) + offset + items.length) % items.length
    items[next]?.focus()
  }

  const onRootKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      if (pane !== 'root') setPane('root')
      else close(true)
      return
    }
    if (!open) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(event.key === 'ArrowDown' ? 1 : -1)
    }
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return
    close()
  }

  const chooseModel = (provider: string, model: string): void => {
    const row = choices.find(c => c.provider === provider && c.model === model)
    const defaultEffort = row?.reasoning?.defaultEffort
    onChange({
      provider,
      model,
      ...defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort },
    })
    close(true)
  }

  const chooseEffort = (effort: string | undefined): void => {
    if (value === undefined) return
    onChange({
      provider: value.provider,
      model: value.model,
      ...effort === undefined ? {} : { reasoningEffort: effort },
    })
    close(true)
  }

  if (sessionId === undefined) {
    return <p className={css.muted}>{t('noSession')}</p>
  }

  const modelLabel = selected?.modelName ?? t('triggerFallback')
  const triggerAria = selected === undefined
    ? t('triggerSelectAria')
    : effortLabel === undefined
      ? modelLabel
      : `${modelLabel} · ${effortLabel}`

  itemRefs.current = []
  let itemIndex = 0
  const itemRef = () => {
    const at = itemIndex++
    return (node: HTMLButtonElement | null) => { itemRefs.current[at] = node }
  }

  const menuClass = placement === 'top'
    ? `${css.menu} ${css.menuTop}`
    : `${css.menu} ${css.menuBottom}`

  return (
    <div
      ref={rootRef}
      className={[css.root, className].filter(Boolean).join(' ')}
      onKeyDown={onRootKeyDown}
      onBlur={onBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        className={css.trigger}
        aria-label={triggerAria}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        title={triggerAria}
        disabled={disabled}
        onClick={() => {
          if (open) close()
          else show()
        }}
      >
        <span className={css.triggerLabel}>{modelLabel}</span>
        {effortLabel !== undefined && <span className={css.triggerEffort}>{effortLabel}</span>}
        <IconChevronDownOutline14 className={[css.chevron, open ? css.chevronOpen : ''].filter(Boolean).join(' ')} />
      </button>

      {open && (
        <div
          id={`${id}-menu`}
          className={menuClass}
          role="menu"
          aria-label={t('menuAria')}
          aria-busy={loading}
        >
          {pane === 'root' && (
            <>
              <button ref={itemRef()} type="button" role="menuitem" className={css.cell} onClick={() => { setPane('model') }}>
                <span className={css.cellLabel}>{t('modelLabel')}</span>
                <span className={css.cellValue}>{modelLabel}</span>
                <IconChevronRightOutline14 className={css.cellChevron} />
              </button>
              {reasoning !== undefined && (
                <button ref={itemRef()} type="button" role="menuitem" className={css.cell} onClick={() => { setPane('effort') }}>
                  <span className={css.cellLabel}>{t('effortLabel')}</span>
                  <span className={css.cellValue}>{effortLabel}</span>
                  <IconChevronRightOutline14 className={css.cellChevron} />
                </button>
              )}
            </>
          )}

          {pane === 'model' && (
            <>
              {loading && <div className={css.status}>{t('statusLoading')}</div>}
              {error !== null && (
                <div className={css.error}>
                  <span>{t('loadError')}: {error}</span>
                  <button type="button" className={css.retry} onClick={load}>{t('retry')}</button>
                </div>
              )}
              <div className={`${css.groups} scrollable`}>
                {groups.map((group) => {
                  const headingId = `${id}-${group.id}`
                  return (
                    <section role="group" aria-labelledby={headingId} className={css.group} key={group.id}>
                      <div className={css.groupTitle} id={headingId}>{group.name}</div>
                      {group.models.map((model) => {
                        const isSelected = value?.provider === group.id && value.model === model.id
                        return (
                          <button
                            ref={itemRef()}
                            type="button"
                            role="menuitemradio"
                            aria-checked={isSelected}
                            className={css.option}
                            key={model.id}
                            title={model.name}
                            disabled={disabled}
                            onClick={() => { chooseModel(group.id, model.id) }}
                          >
                            <span className={css.optionCopy}>
                              <span className={css.modelName}>{model.name}</span>
                              {model.description !== undefined && (
                                <span className={css.description}>{model.description}</span>
                              )}
                            </span>
                            <span className={css.check}>
                              {isSelected ? <IconCheckOutline16 /> : null}
                            </span>
                          </button>
                        )
                      })}
                    </section>
                  )
                })}
              </div>
              {!loading && error === null && choices.length === 0 && (
                <div className={css.empty}>{t('emptyModels')}</div>
              )}
            </>
          )}

          {pane === 'effort' && (
            effortChoices.length === 0
              ? <div className={css.empty}>{t('emptyEfforts')}</div>
              : effortChoices.map(level => (
                <button
                  ref={itemRef()}
                  type="button"
                  role="menuitemradio"
                  aria-checked={effectiveEffort === level.effort}
                  className={css.option}
                  key={level.key}
                  disabled={disabled}
                  onClick={() => { chooseEffort(level.effort) }}
                >
                  <span className={css.optionCopy}>
                    <span className={css.modelName}>{level.label}</span>
                    {level.description !== undefined && (
                      <span className={css.description}>{level.description}</span>
                    )}
                  </span>
                  <span className={css.check}>
                    {effectiveEffort === level.effort ? <IconCheckOutline16 /> : null}
                  </span>
                </button>
              ))
          )}
        </div>
      )}
    </div>
  )
}
