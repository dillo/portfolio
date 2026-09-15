import type { Block, Section } from '@/lib/guides/types'
import { Inline } from '@/components/guides/Inline'

const calloutStyles = {
  tip: { border: 'border-signal', label: 'text-signal', name: 'Tip' },
  note: { border: 'border-accent', label: 'text-accent', name: 'Note' },
  warn: { border: 'border-warn', label: 'text-warn', name: 'Watch out' },
} as const

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading':
      return <h3 className="text-foreground text-lg font-bold">{block.text}</h3>
    case 'table':
      return (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="text-muted w-full text-left text-sm leading-6">
            <thead className="bg-card text-foreground">
              <tr>
                {block.headers.map((header, i) => (
                  <th key={i} scope="col" className="px-4 py-3 font-semibold">
                    <Inline text={header} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-border border-t">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 align-top">
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'p':
      return (
        <p className="text-muted text-[16.5px] leading-[1.75]">
          <Inline text={block.text} />
        </p>
      )
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={`text-muted space-y-2.5 pl-5 text-[16px] leading-[1.7] ${
            block.ordered ? 'list-decimal' : 'marker:text-accent/70 list-disc'
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </Tag>
      )
    }
    case 'callout': {
      const style = calloutStyles[block.tone]
      return (
        <aside className={`bg-card/70 rounded-r-lg border-l-2 ${style.border} px-5 py-4`}>
          <p className={`mb-1.5 text-xs font-bold tracking-widest uppercase ${style.label}`}>
            {style.name} · {block.title}
          </p>
          <p className="text-muted text-[15.5px] leading-[1.7]">
            <Inline text={block.text} />
          </p>
        </aside>
      )
    }
    case 'code':
      return (
        <div className="border-border bg-card overflow-x-auto rounded-lg border">
          <pre className="text-foreground p-5 font-mono text-[13px] leading-[1.65]">
            <code>{block.code}</code>
          </pre>
        </div>
      )
  }
}

export function LessonBody({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-12">
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="text-foreground mb-4 text-xl font-bold tracking-tight sm:text-2xl">
            {section.heading}
          </h2>
          <div className="space-y-5">
            {section.blocks.map((block, j) => (
              <BlockView key={j} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
