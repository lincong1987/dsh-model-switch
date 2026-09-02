/**
 * Compact model catalog picker (settings + plan panel).
 * Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
 */
import type { ModelCatalog, ModelSelection, SessionId } from '@deepseek-ai/dsh-api-remotes/client';
import type { ModelSelectionConfig } from '../shared.ts';
import type { LocaleKey } from './locales.ts';
/** Catalog + current-selection access supplied by the plugin entry. */
export interface ModelCatalogAccess {
    /** Load the deployment model catalog; rejects with a readable error. */
    loadCatalog: () => Promise<ModelCatalog>;
    /** The session's durable selection (`next` over `lastUsed`), if any. */
    currentSelection: (sessionId: SessionId) => ModelSelection | undefined;
}
export interface ModelPickerProps {
    sessionId: SessionId | undefined;
    access: ModelCatalogAccess;
    value: ModelSelectionConfig | undefined;
    onChange: (next: ModelSelectionConfig) => void;
    t: (key: LocaleKey) => string;
    disabled?: boolean;
    className?: string;
    /** Menu opens above (composer/plan) or below (settings). */
    placement?: 'top' | 'bottom';
}
export declare function ModelPicker({ sessionId, access, value, onChange, t, disabled, className, placement, }: ModelPickerProps): import("react").JSX.Element;
