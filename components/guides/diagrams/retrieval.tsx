import { Arrow, C, Caption, DiagramShell, Node, Zone } from './primitives'

export function RagDiagram() {
  return (
    <DiagramShell w={760} h={470} title="Retrieval-augmented generation: ingestion and query time">
      <Zone x={24} y={36} w={712} h={150} label="1 · Ingestion (offline)" tone="plum" />
      <Node x={44} y={84} w={116} h={66} title="Documents" sub="PDFs, wikis, code" />
      <Arrow d="M 160 117 L 196 117" />
      <Node x={200} y={84} w={112} h={66} title="Chunker" sub="split + clean" />
      <Arrow d="M 312 117 L 350 117" />
      <Node x={354} y={84} w={134} h={66} title="Embedding model" sub="chunk → vector" />
      <Arrow d="M 488 117 L 536 117" />
      <Node x={540} y={84} w={150} h={66} title="Vector DB" sub="chunks + vectors" tone="plum" />
      <Zone x={24} y={210} w={712} h={244} label="2 · Query time (online)" tone="rust" />
      <Node x={44} y={262} w={120} h={60} title="User question" tone="rust" />
      <Arrow d="M 164 292 L 206 292" />
      <Node x={210} y={262} w={120} h={60} title="Embed query" />
      <Arrow
        d="M 330 268 C 470 240, 550 200, 606 154"
        label="similarity search"
        lx={470}
        ly={222}
        tone="rust"
      />
      <Arrow
        d="M 630 154 C 620 220, 540 244, 478 260"
        label="top-k chunks"
        lx={590}
        ly={230}
        tone="plum"
      />
      <Node x={396} y={262} w={156} h={60} title="Prompt assembly" sub="question + chunks" />
      <Arrow
        d="M 104 322 C 104 386, 400 386, 452 326"
        dashed
        label="original question"
        lx={240}
        ly={378}
      />
      <Arrow d="M 552 292 L 596 292" />
      <Node x={600} y={262} w={130} h={60} title="LLM" tone="rust" />
      <Arrow d="M 665 322 L 665 358" tone="teal" />
      <Node
        x={584}
        y={362}
        w={152}
        h={64}
        title="Grounded answer"
        sub="with citations"
        tone="teal"
      />
      <Caption
        x={280}
        y={430}
        text="The model answers from your data — not from what it memorized in training."
      />
    </DiagramShell>
  )
}

export function VectorDbDiagram() {
  const dots: [number, number][] = [
    [305, 110],
    [360, 88],
    [415, 126],
    [335, 168],
    [432, 186],
    [372, 212],
  ]
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 5],
    [2, 4],
    [5, 4],
    [1, 3],
  ]
  return (
    <DiagramShell w={760} h={440} title="Inside a vector database: index, ANN search, filtering">
      <Node
        x={24}
        y={60}
        w={190}
        h={60}
        title="Embedding + metadata"
        sub="{vector, source, date}"
      />
      <Arrow d="M 214 90 L 256 90" label="upsert" lx={235} ly={78} />
      <Zone x={260} y={40} w={220} h={210} label="Index · HNSW" tone="plum" />
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={dots[a][0]}
          y1={dots[a][1]}
          x2={dots[b][0]}
          y2={dots[b][1]}
          stroke={C.plum}
          strokeOpacity={0.4}
          strokeWidth={1.2}
        />
      ))}
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={i === 2 ? C.rust : C.plum} />
      ))}
      <Node x={24} y={300} w={156} h={56} title="Query vector" tone="rust" />
      <Arrow
        d="M 180 328 C 230 328, 240 268, 268 232"
        tone="rust"
        label="ANN search"
        lx={146}
        ly={302}
      />
      <Arrow d="M 480 110 L 536 110" tone="plum" />
      <Node x={540} y={82} w={180} h={56} title="Top-k + scores" sub="0.91 · 0.88 · 0.84" />
      <Arrow d="M 630 138 L 630 176" />
      <Node
        x={540}
        y={180}
        w={180}
        h={56}
        title="Metadata filter"
        sub="source = 'docs' AND date > …"
      />
      <Arrow d="M 630 236 L 630 274" />
      <Node
        x={540}
        y={278}
        w={180}
        h={56}
        title="Results"
        sub="chunks for your prompt"
        tone="teal"
      />
      <Caption
        x={380}
        y={412}
        text="Approximate nearest-neighbour search trades a sliver of recall for orders-of-magnitude speed."
      />
    </DiagramShell>
  )
}

export function ChunkingDiagram() {
  return (
    <DiagramShell w={760} h={450} title="Three chunking strategies compared">
      <rect
        x={24}
        y={60}
        width={140}
        height={330}
        rx={10}
        fill={C.node}
        stroke={C.edge}
        strokeWidth={1.4}
      />
      <text x={94} y={88} textAnchor="middle" fill={C.ink} fontSize={13} fontWeight={600}>
        Document
      </text>
      {[110, 130, 150, 180, 200, 220, 250, 270, 300, 320, 340, 360].map((y, i) => (
        <line
          key={i}
          x1={42}
          y1={y}
          x2={i % 4 === 3 ? 100 : 146}
          y2={y}
          stroke={C.faint}
          strokeOpacity={0.5}
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
      <Arrow d="M 164 120 L 196 108" />
      <Arrow d="M 164 225 L 196 225" />
      <Arrow d="M 164 330 L 196 342" />
      <Zone x={200} y={48} w={536} h={110} label="Fixed-size + overlap" tone="rust" />
      {[220, 330, 440, 550].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={98}
          width={130}
          height={38}
          rx={7}
          fill={C.rust}
          fillOpacity={0.13}
          stroke={C.rust}
          strokeOpacity={0.5}
        />
      ))}
      <Caption
        x={468}
        y={148}
        text="predictable size · overlap keeps sentences intact at boundaries"
      />
      <Zone x={200} y={168} w={536} h={110} label="Semantic / structural" tone="plum" />
      {[
        [220, 74],
        [304, 150],
        [464, 96],
        [570, 146],
      ].map(([x, w], i) => (
        <rect
          key={i}
          x={x}
          y={218}
          width={w}
          height={38}
          rx={7}
          fill={C.plum}
          fillOpacity={0.13}
          stroke={C.plum}
          strokeOpacity={0.5}
        />
      ))}
      <Caption
        x={468}
        y={268}
        text="split on headings & paragraphs · chunks follow the document's meaning"
      />
      <Zone x={200} y={288} w={536} h={110} label="Parent–child (small-to-big)" tone="amber" />
      <rect
        x={250}
        y={306}
        width={300}
        height={28}
        rx={7}
        fill={C.amber}
        fillOpacity={0.1}
        stroke={C.amber}
        strokeOpacity={0.5}
        strokeDasharray="5 4"
      />
      <Caption x={400} y={324} text="parent chunk — returned to the LLM" tone="amber" />
      {[240, 340, 440].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={352}
          width={80}
          height={24}
          rx={6}
          fill={C.amber}
          fillOpacity={0.16}
          stroke={C.amber}
          strokeOpacity={0.6}
        />
      ))}
      <Caption x={400} y={390} text="small chunks matched by search" tone="muted" />
      <Arrow d="M 280 350 L 330 336" tone="amber" dashed />
      <Arrow d="M 380 350 L 396 338" tone="amber" dashed />
      <Caption
        x={380}
        y={432}
        text="Chunk size is a retrieval knob: small chunks match precisely, big chunks carry context."
      />
    </DiagramShell>
  )
}

export function KnowledgeQaDiagram() {
  return (
    <DiagramShell w={760} h={440} title="A production knowledge Q&A pipeline">
      <Node x={24} y={80} w={130} h={60} title="Question" tone="rust" />
      <Arrow d="M 154 110 L 186 110" />
      <Node x={190} y={70} w={156} h={80} title="Hybrid retrieval" sub="vector + keyword (BM25)" />
      <Arrow d="M 346 110 L 386 110" />
      <Node x={390} y={80} w={136} h={60} title="Candidates" sub="~50 passages" />
      <Arrow d="M 526 110 L 566 110" />
      <Node
        x={570}
        y={80}
        w={166}
        h={60}
        title="Reranker"
        sub="cross-encoder scoring"
        tone="plum"
      />
      <Arrow d="M 653 140 L 653 186" tone="plum" />
      <Node x={570} y={190} w={166} h={56} title="Top 3–5 passages" />
      <Arrow d="M 566 218 L 496 218" />
      <Node
        x={330}
        y={190}
        w={162}
        h={56}
        title="LLM"
        sub="answers only from context"
        tone="rust"
      />
      <Arrow
        d="M 89 140 C 89 218, 240 218, 326 218"
        dashed
        label="original question"
        lx={170}
        ly={250}
      />
      <Arrow d="M 411 246 L 411 296" tone="teal" />
      <Node
        x={330}
        y={300}
        w={162}
        h={64}
        title="Answer + citations"
        sub="[1] links to sources"
        tone="teal"
      />
      <Arrow
        d="M 492 246 C 560 260, 600 280, 630 296"
        tone="indigo"
        dashed
        label="weak context"
        lx={585}
        ly={254}
      />
      <Node
        x={560}
        y={300}
        w={176}
        h={64}
        title="“I don't know”"
        sub="honesty beats hallucination"
        tone="indigo"
      />
      <Caption
        x={280}
        y={410}
        text="Citations let users verify — the single biggest trust feature you can ship."
      />
    </DiagramShell>
  )
}
