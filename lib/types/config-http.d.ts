/**
 * Same-origin HTTP API for model-switch config (bypasses Web settings allowlist).
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.ts';
/** Browser-facing route. */
export declare const CONFIG_ROUTE = "/_dsh/model-switch/config";
/**
 * Mount GET/POST config routes when a web server is available.
 * @param ctx - host context.
 * @param getConfig - live settings reader.
 * @param setConfig - replace the whole section (host settings.update).
 */
export declare function installConfigHttp(ctx: Context, getConfig: () => Config, setConfig: (next: Config) => Promise<Config>): void;
