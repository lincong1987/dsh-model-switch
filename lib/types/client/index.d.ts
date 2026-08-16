/**
 * Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type LocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'model-switch': LocaleKey;
        /** Reuse stock ui-subagent dictionaries when replacing the catalog seat. */
        'subagent': string;
    }
}
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
