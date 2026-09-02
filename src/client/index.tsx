/**
 * Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote, SessionId, SubagentAddress } from '@deepseek-ai/dsh-api-remotes/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-remotes/client'
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
import type { ModelCatalogAccess } from './ModelPicker.tsx'

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
  'sessions',
  'remote',
  'settingsScope',
]

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-switch: dictionaries')

  const t = ctx.locale.bind(NS) as (key: LocaleKey) => string
  // The host `dsh-session` augmentation wins the Context.sessions interface
  // merge (it loads first through workspace types); the runtime service here is
  // the client ISessions implementation, so retype at the single access point.
  const sessions = ctx.sessions as unknown as ISessions
  const store = new ConfigStore(ctx.settingsScope.bind<Config>({ namespace: MODEL_SWITCH_NS }))
  const labels = new SessionLabelStore()

  const remote = ctx.remote as ClientRemote
  const currentSelection = (sessionId: SessionId): ModelSelection | undefined => {
    const row = sessions.list.getSnapshot().byId[sessionId]
    const selection = row?.projectionValues?.modelSelection
    return selection?.next ?? selection?.lastUsed ?? undefined
  }
  const access: ModelCatalogAccess = {
    async loadCatalog() {
      const result = await remote.session.modelCatalog()
      if (!result.ok) {
        throw new Error(`${result.error.code}: ${result.error.message}`)
      }
      return result.value
    },
    currentSelection,
  }

  const settingsInject = (): SettingsInjected => ({
    store,
    access,
    currentSessionId: () => sessions.list.getSnapshot().current as SessionId | undefined,
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
    remote,
    access,
    t,
    isSessionRunning: (sessionId: SessionId) => (
      sessions.list.getSnapshot().byId[sessionId]?.running === true
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

  const catalogInject = (): SubagentCatalogInjected => ({
    openChild(address: SubagentAddress) {
      sessions.openSubagent(address)
    },
    refresh(parentSessionId: SessionId) {
      void sessions.refreshSubagents(parentSessionId)
    },
    setCatalogOpen(parentSessionId: SessionId, open: boolean) {
      sessions.setSubagentCatalogOpen(parentSessionId, open)
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
