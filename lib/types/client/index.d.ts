/**
 * Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
 */
import type { Context } from '@deepseek-ai/cordis';
import { type LocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'model-switch': LocaleKey;
    }
}
export declare const inject: string[];
export declare function apply(ctx: Context): void;
