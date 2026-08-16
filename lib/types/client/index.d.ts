/**
 * Browser half of dsh-model-switch: settings section + plan-review composer takeover.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type LocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'model-switch': LocaleKey;
    }
}
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
