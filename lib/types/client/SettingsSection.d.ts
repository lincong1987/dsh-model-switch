/**
 * Settings section: 模型切换 — subagent + plan-execute routes.
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import { ConfigStore } from './config-store.ts';
import type { LocaleKey } from './locales.ts';
export interface SettingsInjected {
    store: ConfigStore;
    api: ConnectionHandle['api'];
    currentSessionId: () => SessionId | undefined;
    t: (key: LocaleKey) => string;
}
export type SettingsSectionProps = PropsRuntime<'settings.section'> & Partial<SettingsInjected>;
export declare function SettingsSection(props: SettingsSectionProps): import("react").JSX.Element | null;
