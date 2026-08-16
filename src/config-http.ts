/**
 * Same-origin HTTP API for model-switch config (bypasses Web settings allowlist).
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type { Config } from './config.ts'

/** Browser-facing route. */
export const CONFIG_ROUTE = '/_dsh/model-switch/config'

interface WebRouteHost {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

const WEB_KEYS = ['webServer', 'httpServer'] as const

function json(res: ServerResponse, status: number, body: unknown): void {
  const bytes = Buffer.from(JSON.stringify(body))
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': String(bytes.length),
  })
  res.end(bytes)
}

async function readJson(req: IncomingMessage, maxBytes = 32 * 1024): Promise<unknown> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += part.length
    if (total > maxBytes) throw new RangeError('request body too large')
    chunks.push(part)
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Mount GET/POST config routes when a web server is available.
 * @param ctx - host context.
 * @param getConfig - live settings reader.
 * @param setConfig - replace the whole section (host settings.update).
 */
export function installConfigHttp(
  ctx: Context,
  getConfig: () => Config,
  setConfig: (next: Config) => Promise<Config>,
): void {
  let registered = false
  const mount = (web: WebRouteHost): void => {
    if (registered) return
    registered = true
    ctx.effect(() => web.register({
      kind: 'exact',
      path: CONFIG_ROUTE,
      handler: async (req, res) => {
        try {
          if (req.method === 'GET') {
            json(res, 200, { ok: true, value: getConfig() })
            return
          }
          if (req.method === 'POST' || req.method === 'PUT') {
            const body = await readJson(req)
            if (!isRecord(body)) {
              json(res, 400, { ok: false, error: { code: 'bad-request', message: 'body must be an object' } })
              return
            }
            const next = (isRecord(body.value) ? body.value : body) as Config
            const saved = await setConfig(next)
            json(res, 200, { ok: true, value: saved })
            return
          }
          res.writeHead(405, { allow: 'GET, POST, PUT' })
          res.end()
        } catch (error: unknown) {
          json(res, 500, {
            ok: false,
            error: {
              code: 'internal',
              message: error instanceof Error ? error.message : String(error),
            },
          })
        }
      },
    }), 'model-switch: config route')
  }

  const tryMount = (): void => {
    const web = (ctx.get(WEB_KEYS[0]) ?? ctx.get(WEB_KEYS[1])) as WebRouteHost | undefined
    if (web !== undefined) mount(web)
  }

  tryMount()
  // Prefer the modern service name when present; wait without failing headless boots.
  ctx.inject(['webServer'], (webCtx) => {
    mount(webCtx.webServer as unknown as WebRouteHost)
  })
}
