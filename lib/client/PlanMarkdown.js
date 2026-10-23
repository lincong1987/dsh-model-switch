import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './styles.module.css';
const listMarker = /^\s*([-+*]|\d+[.)])\s+(.+)$/;
const headingMarker = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const quoteMarker = /^\s{0,3}>\s?(.*)$/;
const codeMarker = /^\s{0,3}```\s*([\w+-]*)\s*$/;
const ruleMarker = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
function tableCells(line) {
    if (!line.includes('|'))
        return undefined;
    const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split(/(?<!\\)\|/).map(cell => cell.replace(/\\\|/g, '|').trim());
}
function isTableSeparator(line) {
    const cells = tableCells(line);
    return cells !== undefined && cells.length > 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}
function isTableStart(lines, index) {
    const header = tableCells(lines[index] ?? '');
    return header !== undefined
        && header.length > 1
        && isTableSeparator(lines[index + 1] ?? '');
}
function listItem(value) {
    const task = /^\[([ xX])\]\s+(.*)$/.exec(value);
    return task === null
        ? { text: value }
        : { text: task[2] ?? '', checked: task[1]?.toLowerCase() === 'x' };
}
function startsBlock(lines, index) {
    const line = lines[index] ?? '';
    return codeMarker.test(line)
        || headingMarker.test(line)
        || quoteMarker.test(line)
        || ruleMarker.test(line)
        || listMarker.test(line)
        || isTableStart(lines, index);
}
function parseBlocks(markdown) {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index] ?? '';
        if (line.trim().length === 0) {
            index += 1;
            continue;
        }
        const fence = codeMarker.exec(line);
        if (fence !== null) {
            const body = [];
            index += 1;
            while (index < lines.length && !/^\s{0,3}```\s*$/.test(lines[index] ?? '')) {
                body.push(lines[index] ?? '');
                index += 1;
            }
            if (index < lines.length)
                index += 1;
            blocks.push({
                kind: 'code',
                text: body.join('\n'),
                ...(fence[1] ? { language: fence[1] } : {}),
            });
            continue;
        }
        const heading = headingMarker.exec(line);
        if (heading !== null) {
            blocks.push({ kind: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? '' });
            index += 1;
            continue;
        }
        if (ruleMarker.test(line)) {
            blocks.push({ kind: 'rule' });
            index += 1;
            continue;
        }
        if (isTableStart(lines, index)) {
            const headers = tableCells(line) ?? [];
            index += 2;
            const rows = [];
            while (index < lines.length && (lines[index] ?? '').trim().length > 0) {
                const row = tableCells(lines[index] ?? '');
                if (row === undefined)
                    break;
                rows.push(row);
                index += 1;
            }
            blocks.push({ kind: 'table', headers, rows });
            continue;
        }
        const list = listMarker.exec(line);
        if (list !== null) {
            const ordered = /^\d/.test(list[1] ?? '');
            const items = [];
            while (index < lines.length) {
                const row = listMarker.exec(lines[index] ?? '');
                if (row === null || /^\d/.test(row[1] ?? '') !== ordered)
                    break;
                items.push(listItem(row[2] ?? ''));
                index += 1;
            }
            blocks.push({ kind: ordered ? 'ordered-list' : 'unordered-list', items });
            continue;
        }
        if (quoteMarker.test(line)) {
            const quote = [];
            while (index < lines.length) {
                const row = quoteMarker.exec(lines[index] ?? '');
                if (row === null)
                    break;
                quote.push(row[1] ?? '');
                index += 1;
            }
            blocks.push({ kind: 'quote', text: quote.join('\n') });
            continue;
        }
        const paragraph = [line];
        index += 1;
        while (index < lines.length) {
            const next = lines[index] ?? '';
            if (next.trim().length === 0 || startsBlock(lines, index))
                break;
            paragraph.push(next);
            index += 1;
        }
        blocks.push({ kind: 'paragraph', text: paragraph.join('\n') });
    }
    return blocks;
}
const inlineToken = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|\[[^\]\n]+\]\([^)]+\))/g;
function safeHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
    }
    catch {
        return undefined;
    }
}
function inlineNodes(text, keyPrefix) {
    const nodes = [];
    let cursor = 0;
    let tokenIndex = 0;
    for (const match of text.matchAll(inlineToken)) {
        const token = match[0];
        const offset = match.index ?? cursor;
        if (offset > cursor)
            nodes.push(text.slice(cursor, offset));
        const key = `${keyPrefix}-${tokenIndex++}`;
        if (token.startsWith('`')) {
            nodes.push(_jsx("code", { children: token.slice(1, -1) }, key));
        }
        else if (token.startsWith('**') || token.startsWith('__')) {
            nodes.push(_jsx("strong", { children: inlineNodes(token.slice(2, -2), key) }, key));
        }
        else if (token.startsWith('*') || token.startsWith('_')) {
            nodes.push(_jsx("em", { children: inlineNodes(token.slice(1, -1), key) }, key));
        }
        else if (token.startsWith('~~')) {
            nodes.push(_jsx("del", { children: inlineNodes(token.slice(2, -2), key) }, key));
        }
        else {
            const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
            const href = link === null ? undefined : safeHttpUrl(link[2] ?? '');
            if (link !== null && href !== undefined) {
                nodes.push(_jsx("a", { href: href, target: "_blank", rel: "noreferrer", children: inlineNodes(link[1] ?? '', key) }, key));
            }
            else {
                nodes.push(token);
            }
        }
        cursor = offset + token.length;
    }
    if (cursor < text.length)
        nodes.push(text.slice(cursor));
    return nodes;
}
export function PlanMarkdown({ text }) {
    const blocks = parseBlocks(text);
    return (_jsx("div", { className: css.planText, children: blocks.map((block, index) => {
            const key = `block-${index}`;
            const children = inlineNodes(block.text ?? '', key);
            switch (block.kind) {
                case 'heading': {
                    const level = block.level ?? 1;
                    if (level === 1)
                        return _jsx("h1", { children: children }, key);
                    if (level === 2)
                        return _jsx("h2", { children: children }, key);
                    if (level === 3)
                        return _jsx("h3", { children: children }, key);
                    if (level === 4)
                        return _jsx("h4", { children: children }, key);
                    if (level === 5)
                        return _jsx("h5", { children: children }, key);
                    return _jsx("h6", { children: children }, key);
                }
                case 'unordered-list':
                    return (_jsx("ul", { children: (block.items ?? []).map((item, row) => (_jsxs("li", { className: item.checked === undefined ? undefined : css.taskItem, children: [item.checked !== undefined && (_jsx("span", { className: css.taskCheck, role: "checkbox", "aria-checked": item.checked, "aria-disabled": "true" })), inlineNodes(item.text, `${key}-${row}`)] }, `${key}-${row}`))) }, key));
                case 'ordered-list':
                    return (_jsx("ol", { children: (block.items ?? []).map((item, row) => (_jsx("li", { children: inlineNodes(item.text, `${key}-${row}`) }, `${key}-${row}`))) }, key));
                case 'table':
                    return (_jsx("div", { className: css.tableWrap, children: _jsxs("table", { children: [_jsx("thead", { children: _jsx("tr", { children: (block.headers ?? []).map((cell, column) => _jsx("th", { children: inlineNodes(cell, `${key}-h-${column}`) }, `${key}-h-${column}`)) }) }), _jsx("tbody", { children: (block.rows ?? []).map((row, rowIndex) => (_jsx("tr", { children: (block.headers ?? []).map((_, column) => (_jsx("td", { children: inlineNodes(row[column] ?? '', `${key}-r-${rowIndex}-c-${column}`) }, `${key}-r-${rowIndex}-c-${column}`))) }, `${key}-r-${rowIndex}`))) })] }) }, key));
                case 'quote':
                    return _jsx("blockquote", { children: children }, key);
                case 'code':
                    return (_jsx("pre", { children: _jsx("code", { children: block.text ?? '' }) }, key));
                case 'rule':
                    return _jsx("hr", {}, key);
                case 'paragraph':
                    return _jsx("p", { children: children }, key);
            }
        }) }));
}
