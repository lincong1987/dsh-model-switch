/**
 * Browser half of dsh-model-switch: settings section + plan-review composer takeover.
 */
import { en, zh } from "./locales.js";
import { ConfigStore } from "./config-store.js";
import { SettingsSection } from "./SettingsSection.js";
import { PlanReviewComposer, selectPlanReview, } from "./PlanReviewComposer.js";
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
    });
    ctx.slots.inject('conversation.composer', () => ctx.slots.register({
        name: 'conversation.composer',
        select: selectPlanReview,
        priority: -10,
        locale: NS,
        inject: planInject,
    }, PlanReviewComposer));
}
