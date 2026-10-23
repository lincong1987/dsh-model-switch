import * as React from 'react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client'
import { filterModelGroups, ModelPicker, type ModelCatalogAccess } from '../src/client/ModelPicker.tsx'

Object.assign(globalThis, { React })

const access: ModelCatalogAccess = {
  async loadCatalog() {
    return { groups: [] } as unknown as ModelCatalog
  },
  currentSelection() {
    return undefined
  },
}

const groups = [
  {
    id: 'provider-alpha',
    name: 'Alpha Provider',
    models: [
      { id: 'alpha-reasoner', name: 'Alpha Reasoner', description: 'Reasoning model' },
      { id: 'alpha-fast', name: 'Alpha Fast', description: 'Low-latency model' },
    ],
  },
  {
    id: 'provider-beta',
    name: 'Beta Provider',
    models: [
      { id: 'beta-sonnet', name: 'Beta Sonnet', description: 'Balanced model' },
    ],
  },
] as unknown as ModelCatalog['groups']

describe('ModelPicker', () => {
  it('shows the model selector when settings have no current session', () => {
    const html = renderToStaticMarkup(createElement(ModelPicker, {
      sessionId: undefined,
      access,
      value: undefined,
      onChange: () => {},
      t: key => key,
    }))

    expect(html).toContain('aria-label="triggerSelectAria"')
    expect(html).not.toContain('noSession')
  })

  it('filters case-insensitively by provider, model id, and description', () => {
    expect(filterModelGroups(groups, 'ALPHA PROVIDER').map(group => group.models.map(model => model.id))).toEqual([
      ['alpha-reasoner', 'alpha-fast'],
    ])
    expect(filterModelGroups(groups, 'provider-beta').map(group => group.models.map(model => model.id))).toEqual([
      ['beta-sonnet'],
    ])
    expect(filterModelGroups(groups, 'ALPHA FAST').map(group => group.models.map(model => model.id))).toEqual([
      ['alpha-fast'],
    ])
    expect(filterModelGroups(groups, 'BETA-SONNET').map(group => group.models.map(model => model.id))).toEqual([
      ['beta-sonnet'],
    ])
    expect(filterModelGroups(groups, 'low-latency').map(group => group.models.map(model => model.id))).toEqual([
      ['alpha-fast'],
    ])
    expect(filterModelGroups(groups, 'no-such-model')).toEqual([])
  })
})
