/**
 * Client mirror of the Host plugin Config namespace.
 *
 * DSH 0.2 exposes plugin Config values through the settings Remote. The
 * namespace is the Loader entry id (`model-switch` from cordis.patch.yml).
 */
import { type Config, type RouteSwitchConfig } from '../shared.ts';
export interface ConfigStoreSnapshot {
    status: 'loading' | 'ready' | 'error';
    value: Config;
    error: string | null;
    writable: boolean;
}
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
type RemoteResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: {
        code: string;
        message: string;
    };
};
type SettingsNamespaceView = {
    ns: string;
    value: JsonValue;
    revision: number;
};
type SettingsDescribeValue = {
    writable: boolean;
    namespaces: SettingsNamespaceView[];
};
/** Narrow face verified from DSH 0.2 settingsController's Remote contract. */
export interface ConfigSettingsRemote {
    settings: {
        describe(): Promise<RemoteResult<SettingsDescribeValue>>;
        update(ns: string, patch: Record<string, JsonValue>, expectedRevision: number | undefined): Promise<RemoteResult<SettingsNamespaceView>>;
    };
}
/** Reactive, revision-fenced view of this plugin's Host Config entry. */
export declare class ConfigStore {
    private readonly remote;
    private readonly namespace;
    private snap;
    private revision;
    private readGeneration;
    private writeTail;
    private readonly listeners;
    constructor(remote: ConfigSettingsRemote, namespace?: string);
    getSnapshot: () => ConfigStoreSnapshot;
    subscribe: (listener: () => void) => (() => void);
    refresh(): Promise<void>;
    /** Persist one route against the most recently observed revision. */
    saveRoute(field: 'subagent' | 'planExecute', next: RouteSwitchConfig): Promise<void>;
    private persistRoute;
    private publish;
}
export type { Config };
