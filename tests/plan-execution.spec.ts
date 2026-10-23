import { describe, expect, it } from 'vitest'
import { executeWithTemporaryModel } from '../src/client/plan-execution.ts'
import type { ModelSelectionConfig } from '../src/shared.ts'

const previous: ModelSelectionConfig = { provider: 'provider-a', model: 'model-a' }
const selected: ModelSelectionConfig = { provider: 'provider-b', model: 'model-b' }

describe('executeWithTemporaryModel', () => {
  it('restores the previous model after successful plan approval', async () => {
    const calls: string[] = []
    const result = await executeWithTemporaryModel({
      current: previous,
      selected,
      async setModel(value) { calls.push(`select:${value.model}`) },
      async waitUntilIdle() { calls.push('idle') },
      async execute() { calls.push('approve'); return 'approved' },
      onRestoreError(cause) { throw cause },
    })

    expect(result).toBe('approved')
    expect(calls).toEqual(['select:model-b', 'approve', 'idle', 'select:model-a'])
  })

  it('restores the previous model when answering the plan review rejects', async () => {
    const calls: string[] = []
    await expect(executeWithTemporaryModel({
      current: previous,
      selected,
      async setModel(value) { calls.push(`select:${value.model}`) },
      async waitUntilIdle() { calls.push('idle') },
      async execute() { calls.push('approve'); throw new Error('answer failed') },
      onRestoreError(cause) { throw cause },
    })).rejects.toThrow('answer failed')

    expect(calls).toEqual(['select:model-b', 'approve', 'idle', 'select:model-a'])
  })

  it('does not switch when the selected model is already current', async () => {
    const calls: string[] = []
    await executeWithTemporaryModel({
      current: previous,
      selected: { ...previous },
      async setModel(value) { calls.push(`select:${value.model}`) },
      async waitUntilIdle() { calls.push('idle') },
      async execute() { calls.push('approve'); return undefined },
      onRestoreError(cause) { throw cause },
    })
    expect(calls).toEqual(['approve'])
  })

  it('refuses a non-restorable switch before changing the model', async () => {
    const calls: string[] = []
    await expect(executeWithTemporaryModel({
      current: undefined,
      selected,
      async setModel(value) { calls.push(`select:${value.model}`) },
      async waitUntilIdle() { calls.push('idle') },
      async execute() { calls.push('approve'); return undefined },
      onRestoreError(cause) { throw cause },
    })).rejects.toThrow('non-restorable plan switch')
    expect(calls).toEqual([])
  })
})
