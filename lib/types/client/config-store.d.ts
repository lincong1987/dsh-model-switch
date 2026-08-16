/**
 * Browser client for the host config HTTP surface.
 */
import type { Config } from '../shared.ts';
/** Must match host `CONFIG_ROUTE`. */
export declare const CONFIG_ROUTE = "/_dsh/model-switch/config";
export interface ConfigStoreSnapshot {
    status: 'loading' | 'ready' | 'error';
    value: Config;
    error: string | null;
}
type Listener = () => void;
/** Simple reactive config store over same-origin HTTP. */
export declare class ConfigStore {
    private snapshot;
    private listeners;
    getSnapshot(): ConfigStoreSnapshot;
    subscribe(listener: Listener): () => void;
    private publish;
    load(): Promise<void>;
    save(next: Config): Promise<void>;
}
export {};
