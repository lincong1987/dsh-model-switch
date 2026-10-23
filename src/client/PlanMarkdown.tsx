import React, { type ReactNode } from 'react'
import css from './styles.module.css'

interface PlanListItem {
  text: string
  checked?: boolean
}

interface PlanBlock {
  kind: 'heading' | 'paragraph' | 'unordered-list' | 'ordered-list' | 'quote' | 'code' | 'rule' | 'table'
  text?: string
  level?: number
  items?: PlanListItem[]
  headers?: string[]
  rows?: string[][]
  language?: string
}

const listMarker = /^\s*([-+*]|\d+[.)])\s+(.+)$/
const headingMarker = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/
const quoteMarker = /^\s{0,3}>\s?(.*)$/
const codeMarker = /^\s{0,3}```\s*([\w+-]*)\s*$/
const ruleMarker = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/

function tableCells(line: string): string[] | undefined {
  if (!line.includes('|')) return undefined
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split(/(?<!\\)\|/).map(cell => cell.replace(/\\\|/g, '|').trim())
}

function isTableSeparator(line: string): boolean {
  const cells = tableCells(line)
  return cells !== undefined && cells.length > 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

function isTableStart(lines: readonly string[], index: number): boolean {
  const header = tableCells(lines[index] ?? '')
  return header !== undefined
    && header.length > 1
    && isTableSeparator(lines[index + 1] ?? '')
}

function listItem(value: string): PlanListItem {
  const task = /^\[([ xX])\]\s+(.*)$/.exec(value)
  return task === null
    ? { text: value }
    : { text: task[2] ?? '', checked: task[1]?.toLowerCase() === 'x' }
}

function startsBlock(lines: readonly string[], index: number): boolean {
  const line = lines[index] ?? ''
  return codeMarker.test(line)
    || headingMarker.test(line)
    || quoteMarker.test(line)
    || ruleMarker.test(line)
    || listMarker.test(line)
    || isTableStart(lines, index)
}

function parseBlocks(markdown: string): PlanBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: PlanBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (line.trim().length === 0) {
      index += 1
      continue
    }

    const fence = codeMarker.exec(line)
    if (fence !== null) {
      const body: string[] = []
      index += 1
      while (index < lines.length && !/^\s{0,3}```\s*$/.test(lines[index] ?? '')) {
        body.push(lines[index] ?? '')
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push({
        kind: 'code',
        text: body.join('\n'),
        ...(fence[1] ? { language: fence[1] } : {}),
      })
      continue
    }

    const heading = headingMarker.exec(line)
    if (heading !== null) {
      blocks.push({ kind: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? '' })
      index += 1
      continue
    }

    if (ruleMarker.test(line)) {
      blocks.push({ kind: 'rule' })
      index += 1
      continue
    }

    if (isTableStart(lines, index)) {
      const headers = tableCells(line) ?? []
      index += 2
      const rows: string[][] = []
      while (index < lines.length && (lines[index] ?? '').trim().length > 0) {
        const row = tableCells(lines[index] ?? '')
        if (row === undefined) break
        rows.push(row)
        index += 1
      }
      blocks.push({ kind: 'table', headers, rows })
      continue
    }

    const list = listMarker.exec(line)
    if (list !== null) {
      const ordered = /^\d/.test(list[1] ?? '')
      const items: PlanListItem[] = []
      while (index < lines.length) {
        const row = listMarker.exec(lines[index] ?? '')
        if (row === null || /^\d/.test(row[1] ?? '') !== ordered) break
        items.push(listItem(row[2] ?? ''))
        index += 1
      }
      blocks.push({ kind: ordered ? 'ordered-list' : 'unordered-list', items })
      continue
    }

    if (quoteMarker.test(line)) {
      const quote: string[] = []
      while (index < lines.length) {
        const row = quoteMarker.exec(lines[index] ?? '')
        if (row === null) break
        quote.push(row[1] ?? '')
        index += 1
      }
      blocks.push({ kind: 'quote', text: quote.join('\n') })
      continue
    }

    const paragraph = [line]
    index += 1
    while (index < lines.length) {
      const next = lines[index] ?? ''
      if (next.trim().length === 0 || startsBlock(lines, index)) break
      paragraph.push(next)
      index += 1
    }
    blocks.push({ kind: 'paragraph', text: paragraph.join('\n') })
  }

  return blocks
}

const inlineToken = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|\[[^\]\n]+\]\([^)]+\))/g

function safeHttpUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

function inlineNodes(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let tokenIndex = 0

  for (const match of text.matchAll(inlineToken)) {
    const token = match[0]
    const offset = match.index ?? cursor
    if (offset > cursor) nodes.push(text.slice(cursor, offset))
    const key = `${keyPrefix}-${tokenIndex++}`

    if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(<strong key={key}>{inlineNodes(token.slice(2, -2), key)}</strong>)
    } else if (token.startsWith('*') || token.startsWith('_')) {
      nodes.push(<em key={key}>{inlineNodes(token.slice(1, -1), key)}</em>)
    } else if (token.startsWith('~~')) {
      nodes.push(<del key={key}>{inlineNodes(token.slice(2, -2), key)}</del>)
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      const href = link === null ? undefined : safeHttpUrl(link[2] ?? '')
      if (link !== null && href !== undefined) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {inlineNodes(link[1] ?? '', key)}
          </a>,
        )
      } else {
        nodes.push(token)
      }
    }
    cursor = offset + token.length
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

export function PlanMarkdown({ text }: { text: string }) {
  const blocks = parseBlocks(text)
  return (
    <div className={css.planText}>
      {blocks.map((block, index) => {
        const key = `block-${index}`
        const children = inlineNodes(block.text ?? '', key)
        switch (block.kind) {
          case 'heading': {
            const level = block.level ?? 1
            if (level === 1) return <h1 key={key}>{children}</h1>
            if (level === 2) return <h2 key={key}>{children}</h2>
            if (level === 3) return <h3 key={key}>{children}</h3>
            if (level === 4) return <h4 key={key}>{children}</h4>
            if (level === 5) return <h5 key={key}>{children}</h5>
            return <h6 key={key}>{children}</h6>
          }
          case 'unordered-list':
            return (
              <ul key={key}>
                {(block.items ?? []).map((item, row) => (
                  <li key={`${key}-${row}`} className={item.checked === undefined ? undefined : css.taskItem}>
                    {item.checked !== undefined && (
                      <span
                        className={css.taskCheck}
                        role="checkbox"
                        aria-checked={item.checked}
                        aria-disabled="true"
                      />
                    )}
                    {inlineNodes(item.text, `${key}-${row}`)}
                  </li>
                ))}
              </ul>
            )
          case 'ordered-list':
            return (
              <ol key={key}>
                {(block.items ?? []).map((item, row) => (
                  <li key={`${key}-${row}`}>{inlineNodes(item.text, `${key}-${row}`)}</li>
                ))}
              </ol>
            )
          case 'table':
            return (
              <div className={css.tableWrap} key={key}>
                <table>
                  <thead>
                    <tr>{(block.headers ?? []).map((cell, column) => <th key={`${key}-h-${column}`}>{inlineNodes(cell, `${key}-h-${column}`)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {(block.rows ?? []).map((row, rowIndex) => (
                      <tr key={`${key}-r-${rowIndex}`}>
                        {(block.headers ?? []).map((_, column) => (
                          <td key={`${key}-r-${rowIndex}-c-${column}`}>
                            {inlineNodes(row[column] ?? '', `${key}-r-${rowIndex}-c-${column}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'quote':
            return <blockquote key={key}>{children}</blockquote>
          case 'code':
            return (
              <pre key={key}>
                <code>{block.text ?? ''}</code>
              </pre>
            )
          case 'rule':
            return <hr key={key} />
          case 'paragraph':
            return <p key={key}>{children}</p>
        }
      })}
    </div>
  )
}
