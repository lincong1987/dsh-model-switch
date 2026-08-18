/**
 * Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
 */

import type { ClientContext, SessionId, SubagentAddress } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { MODEL_SWITCH_NS, type Config } from '../shared.ts'
import { en, zh, type LocaleKey } from './locales.ts'
import { ConfigStore } from './config-store.ts'
import { SettingsSection, type SettingsInjected } from './SettingsSection.tsx'
import {
  PlanReviewComposer,
  selectPlanReview,
  type PlanReviewComposerInjected,
} from './PlanReviewComposer.tsx'
import { SubagentModelBadge, type SubagentModelBadgeInjected } from './SubagentModelBadge.tsx'
import {
  SubagentCatalogAction,
  type SubagentCatalogInjected,
} from './SubagentCatalogAction.tsx'
import { SessionLabelStore } from './session-label-store.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'model-switch': LocaleKey
    /** Reuse stock ui-subagent dictionaries when replacing the catalog seat. */
    'subagent': string
  }
}

const NS = 'model-switch'

export const inject = [
  'slots',
  'locale',
  'connection',
  'sessions',
  'remote',
  'settingsScope',
]

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-switch: dictionaries')

  const t = ctx.locale.bind(NS) as (key: LocaleKey) => string
  const connection = ctx.get('connection') as ConnectionHandle
  const store = new ConfigStore(ctx.settingsScope.bind<Config>({ namespace: MODEL_SWITCH_NS }))
  const labels = new SessionLabelStore()

  const settingsInject = (): SettingsInjected => ({
    store,
    api: connection.api,
    currentSessionId: () => ctx.sessions.list.getSnapshot().current as SessionId | undefined,
    t,
  })

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'model-switch',
    order: 80,
    label: () => t('nav'),
    inject: settingsInject,
  }, SettingsSection))

  const planInject = (): PlanReviewComposerInjected => ({
    store,
    api: connection.api,
    t,
    isSessionRunning: (sessionId: SessionId) => (
      ctx.sessions.list.getSnapshot().byId[sessionId]?.running === true
    ),
  })

  ctx.slots.inject('conversation.composer', () => ctx.slots.register({
    name: 'conversation.composer',
    select: selectPlanReview,
    priority: -10,
    locale: NS,
    inject: planInject,
  }, PlanReviewComposer))

  const badgeInject = (): SubagentModelBadgeInjected => ({ labels })

  // Sits beside the hierarchy crumbs (header.actions is the neighbour of 会话层级).
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'model-switch-badge',
    order: 5,
    inject: badgeInject,
  }, SubagentModelBadge))

  const catalogInject = (_parentSessionId: SessionId): SubagentCatalogInjected => ({
    openChild(address: SubagentAddress) {
      ctx.sessions.openSubagent(address)
    },
    refresh(parentSessionId: SessionId) {
      void ctx.sessions.refreshSubagents(parentSessionId)
    },
    setCatalogOpen(parentSessionId: SessionId, open: boolean) {
      ctx.sessions.setSubagentCatalogOpen(parentSessionId, open)
    },
    labels,
  })

  // Same id as stock ui-subagent entry; lower priority shadows it (lowest renders).
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'subagent-catalog',
    order: 10,
    priority: -1,
    locale: 'subagent',
    inject: catalogInject,
  }, SubagentCatalogAction))
}
