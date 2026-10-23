import type { ModelSelectionConfig } from '../shared.ts'

export interface TemporaryModelExecution<T> {
  current: ModelSelectionConfig | undefined
  selected: ModelSelectionConfig
  setModel: (selection: ModelSelectionConfig) => Promise<void>
  waitUntilIdle: () => Promise<void>
  execute: () => Promise<T>
  onRestoreError: (cause: unknown) => void
}

function sameSelection(a: ModelSelectionConfig, b: ModelSelectionConfig): boolean {
  return a.provider === b.provider
    && a.model === b.model
    && (a.reasoningEffort ?? undefined) === (b.reasoningEffort ?? undefined)
}

/** Run one operation with a temporary model and restore the known prior model. */
export async function executeWithTemporaryModel<T>(
  input: TemporaryModelExecution<T>,
): Promise<T> {
  const { current, selected, setModel, waitUntilIdle, execute, onRestoreError } = input
  if (current === undefined) {
    throw new Error('Cannot determine the current session model; refusing a non-restorable plan switch')
  }
  if (sameSelection(current, selected)) return execute()

  let switched = false
  try {
    // Mark before dispatch so an ambiguous lost response still triggers rollback.
    switched = true
    await setModel(selected)
    return await execute()
  } finally {
    if (switched) {
      try {
        await waitUntilIdle()
        await setModel(current)
      } catch (cause: unknown) {
        onRestoreError(cause)
      }
    }
  }
}
