import { describe, expect, it } from 'vitest'
import { mergeAgentOptions } from '../src/merge.ts'
import { resolveCustomSelection, resolvePlanExecuteSelection } from '../src/shared.ts'

describe('mergeAgentOptions', () => {
  it('fills provider/model from selection when request omits them', () => {
    expect(mergeAgentOptions(undefined, { provider: 'p', model: 'm' })).toEqual({
      provider: 'p',
      model: 'm',
    })
  })

  it('lets explicit request fields win', () => {
    expect(mergeAgentOptions(
      { provider: 'req-p', model: 'req-m', maxTokens: 10 },
      { provider: 'set-p', model: 'set-m' },
    )).toEqual({
      provider: 'req-p',
      model: 'req-m',
      maxTokens: 10,
    })
  })
})

describe('resolveCustomSelection', () => {
  it('returns undefined for follow-main', () => {
    expect(resolveCustomSelection({ mode: 'follow-main' })).toBeUndefined()
  })

  it('returns undefined for incomplete custom', () => {
    expect(resolveCustomSelection({ mode: 'custom', selection: { provider: '', model: 'm' } })).toBeUndefined()
  })

  it('returns trimmed selection for custom', () => {
    expect(resolveCustomSelection({
      mode: 'custom',
      selection: { provider: ' p ', model: ' m ', reasoningEffort: ' high ' },
    })).toEqual({ provider: 'p', model: 'm', reasoningEffort: 'high' })
  })
})

describe('resolvePlanExecuteSelection', () => {
  it('prefers panel override over settings', () => {
    expect(resolvePlanExecuteSelection(
      { planExecute: { mode: 'custom', selection: { provider: 'set', model: 'set-m' } } },
      { provider: 'panel', model: 'panel-m' },
    )).toEqual({ provider: 'panel', model: 'panel-m' })
  })

  it('falls back to settings when panel is absent', () => {
    expect(resolvePlanExecuteSelection(
      { planExecute: { mode: 'custom', selection: { provider: 'set', model: 'set-m' } } },
      undefined,
    )).toEqual({ provider: 'set', model: 'set-m' })
  })
})
