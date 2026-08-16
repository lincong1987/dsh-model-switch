/**
 * Compact model catalog picker (settings + plan panel).
 * Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client';
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { ModelSelectionConfig } from '../shared.ts';
import type { LocaleKey } from './locales.ts';
export interface ModelPickerProps {
    sessionId: SessionId | undefined;
    api: ConnectionHandle['api'];
    value: ModelSelectionConfig | undefined;
    onChange: (next: ModelSelectionConfig) => void;
    t: (key: LocaleKey) => string;
    disabled?: boolean;
    className?: string;
    /** Menu opens above (composer/plan) or below (settings). */
    placement?: 'top' | 'bottom';
}
export declare function ModelPicker({ sessionId, api, value, onChange, t, disabled, className, placement, }: ModelPickerProps): import("react").JSX.Element;
