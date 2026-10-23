import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PlanMarkdown } from '../src/client/PlanMarkdown.tsx'

function render(text: string): string {
  return renderToStaticMarkup(createElement(PlanMarkdown, { text }))
}

describe('PlanMarkdown', () => {
  it('renders plan headings, lists, inline emphasis, code blocks, and safe links', () => {
    const html = render([
      '# Plan',
      '',
      '- **First** step',
      '- run `pnpm test`',
      '- [x] checked ~~old step~~',
      '',
      '| Step | Result |',
      '| --- | --- |',
      '| Build | pass |',
      '',
      '```ts',
      'const answer = 42',
      '```',
      '',
      '[Docs](https://example.com/guide)',
    ].join('\n'))

    expect(html).toContain('<h1>Plan</h1>')
    expect(html).toContain('<ul><li><strong>First</strong> step</li>')
    expect(html).toContain('<code>pnpm test</code>')
    expect(html).toContain('<del>old step</del>')
    expect(html).toContain('role="checkbox" aria-checked="true" aria-disabled="true"')
    expect(html).toContain('<table><thead><tr><th>Step</th><th>Result</th></tr></thead>')
    expect(html).toContain('<pre><code>const answer = 42</code></pre>')
    expect(html).toContain('href="https://example.com/guide"')
    expect(html).toContain('rel="noreferrer"')
  })

  it('renders unsafe links as text instead of creating an active href', () => {
    const html = render('[bad](javascript:alert(1))')
    expect(html).toContain('bad')
    expect(html).not.toContain('href=')
  })
})
