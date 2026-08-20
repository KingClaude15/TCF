/**
 * Lightweight markdown renderer for AI chat bubbles.
 * Supports: **bold**, *italic*, `code`, lists, headings, tables, paragraphs.
 * No external dependency.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineFormat(text) {
  let s = escapeHtml(text)
  // bold **text** or __text__
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ink-900 dark:text-white">$1</strong>')
  s = s.replace(/__(.+?)__/g, '<strong class="font-semibold text-ink-900 dark:text-white">$1</strong>')
  // italic *text* or _text_ (avoid matching bold leftovers)
  s = s.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em class="italic">$2</em>')
  // inline code
  s = s.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-200/80 px-1 py-0.5 text-[12px] font-mono dark:bg-slate-700">$1</code>')
  return s
}

function isTableSeparator(line) {
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(line.trim())
}

function isTableRow(line) {
  return line.trim().startsWith('|') && line.trim().endsWith('|')
}

function parseTable(lines, start) {
  const rows = []
  let i = start
  while (i < lines.length && (isTableRow(lines[i]) || isTableSeparator(lines[i]))) {
    if (!isTableSeparator(lines[i])) {
      const cells = lines[i]
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim())
      rows.push(cells)
    }
    i++
  }
  if (rows.length === 0) return { html: '', next: start + 1 }

  const header = rows[0]
  const body = rows.slice(1)
  let html =
    '<div class="my-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">' +
    '<table class="w-full min-w-[280px] border-collapse text-left text-[13px]">' +
    '<thead class="bg-slate-100 dark:bg-slate-800"><tr>'
  header.forEach((c) => {
    html += `<th class="border-b border-slate-200 px-3 py-2 font-semibold dark:border-slate-600">${inlineFormat(c)}</th>`
  })
  html += '</tr></thead><tbody>'
  body.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '' : ' class="bg-slate-50/80 dark:bg-slate-800/40"'
    html += `<tr${bg}>`
    row.forEach((c) => {
      html += `<td class="border-b border-slate-100 px-3 py-2 align-top dark:border-slate-700">${inlineFormat(c)}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody></table></div>'
  return { html, next: i }
}

export default function ChatMarkdown({ content }) {
  if (!content) return null

  const lines = String(content).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // empty line → spacing
    if (!trimmed) {
      i++
      continue
    }

    // table
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const { html, next } = parseTable(lines, i)
      blocks.push(html)
      i = next
      continue
    }

    // heading
    const h = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (h) {
      const level = h[1].length
      const cls =
        level === 1
          ? 'text-base font-bold mt-2 mb-1'
          : level === 2
            ? 'text-sm font-bold mt-2 mb-1'
            : 'text-sm font-semibold mt-1.5 mb-0.5'
      blocks.push(`<p class="${cls} text-ink-900 dark:text-white">${inlineFormat(h[2])}</p>`)
      i++
      continue
    }

    // unordered list block
    if (/^[-*•]\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''))
        i++
      }
      blocks.push(
        '<ul class="my-1.5 list-disc space-y-1 pl-5">' +
          items.map((it) => `<li class="leading-relaxed">${inlineFormat(it)}</li>`).join('') +
          '</ul>',
      )
      continue
    }

    // ordered list block
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''))
        i++
      }
      blocks.push(
        '<ol class="my-1.5 list-decimal space-y-1 pl-5">' +
          items.map((it) => `<li class="leading-relaxed">${inlineFormat(it)}</li>`).join('') +
          '</ol>',
      )
      continue
    }

    // paragraph (merge consecutive non-special lines)
    const para = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isTableRow(lines[i].trim()) &&
      !/^#{1,3}\s+/.test(lines[i].trim()) &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim())
      i++
    }
    if (para.length) {
      blocks.push(
        `<p class="my-1 leading-relaxed">${para.map(inlineFormat).join('<br/>')}</p>`,
      )
    }
  }

  return (
    <div
      className="chat-md text-[13.5px] text-slate-800 dark:text-slate-100"
      dangerouslySetInnerHTML={{ __html: blocks.join('') }}
    />
  )
}
