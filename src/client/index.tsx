/**
 * Browser half of dsh-model-switch: settings section + plan-review composer takeover.
 */

import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { en, zh, type LocaleKey } from './locales.ts'
import { ConfigStore } from './config-store.ts'
import { SettingsSection, type SettingsInjected } from './SettingsSection.tsx'
import {
  PlanReviewComposer,
  selectPlanReview,
  type PlanReviewComposerInjected,
} from './PlanReviewComposer.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'model-switch': LocaleKey
  }
}

const NS = 'model-switch'

export const inject = [
  'slots',
  'locale',
  'connection',
  'sessions',
]

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-switch: dictionaries')

  const t = ctx.locale.bind(NS) as (key: LocaleKey) => string
  const connection = ctx.get('connection') as ConnectionHandle
  const store = new ConfigStore()

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
  })

  ctx.slots.inject('conversation.composer', () => ctx.slots.register({
    name: 'conversation.composer',
    select: selectPlanReview,
    priority: -10,
    locale: NS,
    inject: planInject,
  }, PlanReviewComposer))
}
