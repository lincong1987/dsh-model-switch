/**
 * Same-origin HTTP API for model-switch config (bypasses Web settings allowlist).
 */
/** Browser-facing route. */
export const CONFIG_ROUTE = '/_dsh/model-switch/config';
const WEB_KEYS = ['webServer', 'httpServer'];
function json(res, status, body) {
    const bytes = Buffer.from(JSON.stringify(body));
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'content-length': String(bytes.length),
    });
    res.end(bytes);
}
async function readJson(req, maxBytes = 32 * 1024) {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
        const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += part.length;
        if (total > maxBytes)
            throw new RangeError('request body too large');
        chunks.push(part);
    }
    if (chunks.length === 0)
        return {};
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Mount GET/POST config routes when a web server is available.
 * @param ctx - host context.
 * @param getConfig - live settings reader.
 * @param setConfig - replace the whole section (host settings.update).
 */
export function installConfigHttp(ctx, getConfig, setConfig) {
    let registered = false;
    const mount = (web) => {
        if (registered)
            return;
        registered = true;
        ctx.effect(() => web.register({
            kind: 'exact',
            path: CONFIG_ROUTE,
            handler: async (req, res) => {
                try {
                    if (req.method === 'GET') {
                        json(res, 200, { ok: true, value: getConfig() });
                        return;
                    }
                    if (req.method === 'POST' || req.method === 'PUT') {
                        const body = await readJson(req);
                        if (!isRecord(body)) {
                            json(res, 400, { ok: false, error: { code: 'bad-request', message: 'body must be an object' } });
                            return;
                        }
                        const next = (isRecord(body.value) ? body.value : body);
                        const saved = await setConfig(next);
                        json(res, 200, { ok: true, value: saved });
                        return;
                    }
                    res.writeHead(405, { allow: 'GET, POST, PUT' });
                    res.end();
                }
                catch (error) {
                    json(res, 500, {
                        ok: false,
                        error: {
                            code: 'internal',
                            message: error instanceof Error ? error.message : String(error),
                        },
                    });
                }
            },
        }), 'model-switch: config route');
    };
    const tryMount = () => {
        const web = (ctx.get(WEB_KEYS[0]) ?? ctx.get(WEB_KEYS[1]));
        if (web !== undefined)
            mount(web);
    };
    tryMount();
    // Prefer the modern service name when present; wait without failing headless boots.
    ctx.inject(['webServer'], (webCtx) => {
        mount(webCtx.webServer);
    });
}
