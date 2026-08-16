/**
 * Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
 */
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
    'connection',
    'sessions',
];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-switch: dictionaries');
    const t = ctx.locale.bind(NS);
    const connection = ctx.get('connection');
    const store = new ConfigStore();
    const labels = new SessionLabelStore();
    const settingsInject = () => ({
        store,
        api: connection.api,
        currentSessionId: () => ctx.sessions.list.getSnapshot().current,
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
        api: connection.api,
        t,
        isSessionRunning: (sessionId) => (ctx.sessions.list.getSnapshot().byId[sessionId]?.running === true),
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
    const catalogInject = (_parentSessionId) => ({
        openChild(address) {
            ctx.sessions.openSubagent(address);
        },
        refresh(parentSessionId) {
            void ctx.sessions.refreshSubagents(parentSessionId);
        },
        setCatalogOpen(parentSessionId, open) {
            ctx.sessions.setSubagentCatalogOpen(parentSessionId, open);
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
