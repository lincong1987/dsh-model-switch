/**
 * Settings section: 模型切换 — subagent + plan-execute routes.
 */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client';
import { ConfigStore } from './config-store.ts';
import { type ModelCatalogAccess } from './ModelPicker.tsx';
import type { LocaleKey } from './locales.ts';
export interface SettingsInjected {
    store: ConfigStore;
    access: ModelCatalogAccess;
    currentSessionId: () => SessionId | undefined;
    t: (key: LocaleKey) => string;
}
export type SettingsSectionProps = PropsRuntime<'settings.section'> & Partial<SettingsInjected>;
export declare function SettingsSection(props: SettingsSectionProps): import("react").JSX.Element | null;
