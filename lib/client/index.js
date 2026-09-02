/**
 * Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
 */
import { MODEL_SWITCH_NS } from "../shared.js";
import { en, zh } from "./locales.js";
import { ConfigStore } from "./config-store.js";
import { SettingsSection } from "./SettingsSection.js";
import { PlanReviewComposer, selectPlanReview, } from "./PlanReviewComposer.js";
import { SubagentModelBadge } from "./SubagentModelBadge.js";
import { SubagentCatalogAction, } from "./SubagentCatalogAction.js";
import { SessionLabelStore } from "./session-label-store.js";
const NS = 'model-switch';
export const inject = [
    'slots',
    'locale',
    'sessions',
    'remote',
    'remote.session',
    'settingsScope',
];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-switch: dictionaries');
    const t = ctx.locale.bind(NS);
    // The host `dsh-session` augmentation wins the Context.sessions interface
    // merge (it loads first through workspace types); the runtime service here is
    // the client ISessions implementation, so retype at the single access point.
    const sessions = ctx.sessions;
    const store = new ConfigStore(ctx.settingsScope.bind({ namespace: MODEL_SWITCH_NS }));
    const labels = new SessionLabelStore();
    const remote = ctx.remote;
    const currentSelection = (sessionId) => {
        const row = sessions.list.getSnapshot().byId[sessionId];
        const selection = row?.projectionValues?.modelSelection;
        return selection?.next ?? selection?.lastUsed ?? undefined;
    };
    const access = {
        async loadCatalog() {
            const result = await remote.session.modelCatalog();
            if (!result.ok) {
                throw new Error(`${result.error.code}: ${result.error.message}`);
            }
            return result.value;
        },
        currentSelection,
    };
    const settingsInject = () => ({
        store,
        access,
        currentSessionId: () => sessions.list.getSnapshot().current,
        t,
    });
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'model-switch',
        order: 80,
        label: () => t('nav'),
        inject: settingsInject,
    }, SettingsSection));
    const planInject = () => ({
        store,
        remote,
        access,
        t,
        isSessionRunning: (sessionId) => (sessions.list.getSnapshot().byId[sessionId]?.running === true),
    });
    ctx.slots.inject('conversation.composer', () => ctx.slots.register({
        name: 'conversation.composer',
        select: selectPlanReview,
        priority: -10,
        locale: NS,
        inject: planInject,
    }, PlanReviewComposer));
    const badgeInject = () => ({ labels });
    // Sits beside the hierarchy crumbs (header.actions is the neighbour of 会话层级).
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'model-switch-badge',
        order: 5,
        inject: badgeInject,
    }, SubagentModelBadge));
    const catalogInject = () => ({
        openChild(address) {
            sessions.openSubagent(address);
        },
        refresh(parentSessionId) {
            void sessions.refreshSubagents(parentSessionId);
        },
        setCatalogOpen(parentSessionId, open) {
            sessions.setSubagentCatalogOpen(parentSessionId, open);
        },
        labels,
    });
    // Same id as stock ui-subagent entry; lower priority shadows it (lowest renders).
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'subagent-catalog',
        order: 10,
        priority: -1,
        locale: 'subagent',
        inject: catalogInject,
    }, SubagentCatalogAction));
}
