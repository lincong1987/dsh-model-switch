/**
 * Browser client for the host config HTTP surface.
 */
/** Must match host `CONFIG_ROUTE`. */
export const CONFIG_ROUTE = '/_dsh/model-switch/config';
/** Simple reactive config store over same-origin HTTP. */
export class ConfigStore {
    snapshot = {
        status: 'loading',
        value: {},
        error: null,
    };
    listeners = new Set();
    getSnapshot() {
        return this.snapshot;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    publish(next) {
        this.snapshot = next;
        for (const listener of this.listeners)
            listener();
    }
    async load() {
        this.publish({ ...this.snapshot, status: 'loading', error: null });
        try {
            const response = await fetch(CONFIG_ROUTE, { credentials: 'same-origin' });
            const body = await response.json();
            if (!response.ok || !body.ok || body.value === undefined) {
                throw new Error(body.error?.message ?? `HTTP ${response.status}`);
            }
            this.publish({ status: 'ready', value: body.value, error: null });
        }
        catch (error) {
            this.publish({
                status: 'error',
                value: this.snapshot.value,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async save(next) {
        this.publish({ ...this.snapshot, status: 'loading', error: null });
        try {
            const response = await fetch(CONFIG_ROUTE, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ value: next }),
            });
            const body = await response.json();
            if (!response.ok || !body.ok || body.value === undefined) {
                throw new Error(body.error?.message ?? `HTTP ${response.status}`);
            }
            this.publish({ status: 'ready', value: body.value, error: null });
        }
        catch (error) {
            this.publish({
                status: 'error',
                value: this.snapshot.value,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
