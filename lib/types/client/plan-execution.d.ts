import type { ModelSelectionConfig } from '../shared.ts';
export interface TemporaryModelExecution<T> {
    current: ModelSelectionConfig | undefined;
    selected: ModelSelectionConfig;
    setModel: (selection: ModelSelectionConfig) => Promise<void>;
    waitUntilIdle: () => Promise<void>;
    execute: () => Promise<T>;
    onRestoreError: (cause: unknown) => void;
}
/** Run one operation with a temporary model and restore the known prior model. */
export declare function executeWithTemporaryModel<T>(input: TemporaryModelExecution<T>): Promise<T>;
