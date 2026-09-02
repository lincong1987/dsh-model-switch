/**
 * Browser mirror of the host `model-switch` settings namespace.
 *
 * DSH 0.1.2-alpha.4+ serves plugin-registered namespaces through settings.*;
 * this store is a stable snapshot wrapper over `ctx.settingsScope`.
 */
const EMPTY = {};
function view(snap) {
    if (snap.status === 'unavailable') {
        return { status: 'error', value: snap.value ?? EMPTY, error: 'unavailable' };
    }
    if (snap.status === 'loading' && snap.value === undefined) {
        return { status: 'loading', value: EMPTY, error: null };
    }
    return { status: 'ready', value: snap.value ?? EMPTY, error: null };
}
/** Reactive config store over the client settings-namespace scope. */
export class ConfigStore {
    scope;
    lastRaw;
    lastView = { status: 'loading', value: EMPTY, error: null };
    constructor(scope) {
        this.scope = scope;
    }
    getSnapshot() {
        const raw = this.scope.getSnapshot();
        if (raw === this.lastRaw)
            return this.lastView;
        this.lastRaw = raw;
        this.lastView = view(raw);
        return this.lastView;
    }
    subscribe(listener) {
        return this.scope.subscribe(listener);
    }
    /**
     * Persist one route field. `settingsScope.set` is one field per call and
     * fences the write with the latest known namespace revision.
     */
    async saveRoute(field, next) {
        await this.scope.set(field, next);
        const snap = this.getSnapshot();
        if (snap.status === 'error') {
            throw new Error(snap.error ?? 'unavailable');
        }
    }
}
