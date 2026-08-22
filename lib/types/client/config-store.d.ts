/**
 * Browser mirror of the host `model-switch` settings namespace.
 *
 * DSH 0.1.1-rc.2 serves plugin-registered namespaces through settings.*;
 * this store is a stable snapshot wrapper over `ctx.settingsScope`.
 */
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import type { Config, RouteSwitchConfig } from '../shared.ts';
export interface ConfigStoreSnapshot {
    status: 'loading' | 'ready' | 'error';
    value: Config;
    error: string | null;
}
/** Reactive config store over the client settings-namespace scope. */
export declare class ConfigStore {
    private readonly scope;
    private lastRaw;
    private lastView;
    constructor(scope: SettingsScope<Config>);
    getSnapshot(): ConfigStoreSnapshot;
    subscribe(listener: () => void): () => void;
    /**
     * Persist one route field. `settingsScope.set` is one field per call and
     * fences the write with the latest known namespace revision.
     */
    saveRoute(field: 'subagent' | 'planExecute', next: RouteSwitchConfig): Promise<void>;
}
