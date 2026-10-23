/**
 * Client mirror of the Host plugin Config namespace.
 *
 * DSH 0.2 exposes plugin Config values through the settings Remote. The
 * namespace is the Loader entry id (`model-switch` from cordis.patch.yml).
 */
import { MODEL_SWITCH_NS } from "../shared.js";
const EMPTY = {};
/**
 * Strip own-properties whose value is `undefined` before the strict Remote codec.
 * For example, a route with `selection: undefined` is not valid JSON.
 */
function toJsonPatch(field, value) {
    return JSON.parse(JSON.stringify({ [field]: value }));
}
function errorMessage(error) {
    return `${error.code}: ${error.message}`;
}
/** Reactive, revision-fenced view of this plugin's Host Config entry. */
export class ConfigStore {
    remote;
    namespace;
    snap = {
        status: 'loading',
        value: EMPTY,
        error: null,
        writable: false,
    };
    revision;
    readGeneration = 0;
    writeTail = Promise.resolve();
    listeners = new Set();
    constructor(remote, namespace = MODEL_SWITCH_NS) {
        this.remote = remote;
        this.namespace = namespace;
    }
    getSnapshot = () => this.snap;
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    async refresh() {
        const generation = ++this.readGeneration;
        let result;
        try {
            result = await this.remote.settings.describe();
        }
        catch (cause) {
            if (generation !== this.readGeneration)
                return;
            this.revision = undefined;
            this.publish({
                ...this.snap,
                status: 'error',
                error: cause instanceof Error ? cause.message : String(cause),
                writable: false,
            });
            return;
        }
        if (generation !== this.readGeneration)
            return;
        if (!result.ok) {
            this.revision = undefined;
            this.publish({
                ...this.snap,
                status: 'error',
                error: errorMessage(result.error),
                writable: false,
            });
            return;
        }
        const entry = result.value.namespaces.find(row => row.ns === this.namespace);
        if (entry === undefined) {
            this.revision = undefined;
            this.publish({
                ...this.snap,
                status: 'error',
                error: `settings namespace not found: ${this.namespace}`,
                writable: false,
            });
            return;
        }
        this.revision = entry.revision;
        this.publish({
            status: 'ready',
            value: entry.value,
            error: null,
            writable: result.value.writable,
        });
    }
    /** Persist one route against the most recently observed revision. */
    saveRoute(field, next) {
        const task = this.writeTail.then(() => this.persistRoute(field, next));
        this.writeTail = task.then(() => undefined, () => undefined);
        return task;
    }
    async persistRoute(field, next) {
        if (this.snap.status !== 'ready' || this.revision === undefined) {
            throw new Error(this.snap.error ?? 'settings are not loaded');
        }
        if (!this.snap.writable)
            throw new Error('host settings are read-only');
        const result = await this.remote.settings.update(this.namespace, toJsonPatch(field, next), this.revision);
        if (!result.ok) {
            await this.refresh();
            throw new Error(errorMessage(result.error));
        }
        this.revision = result.value.revision;
        this.publish({
            status: 'ready',
            value: result.value.value,
            error: null,
            writable: this.snap.writable,
        });
    }
    publish(next) {
        this.snap = next;
        for (const listener of this.listeners)
            listener();
    }
}
