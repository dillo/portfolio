import { Arrow, Caption, Chip, DiagramShell, Node, Zone } from './primitives'

export function AiCodingDiagram() {
  return (
    <DiagramShell w={760} h={450} title="An AI-assisted coding workflow with verification loops">
      <Node x={24} y={80} w={122} h={60} title="Spec / issue" sub="what & why" />
      <Arrow d="M 146 110 L 182 110" />
      <Node x={186} y={80} w={134} h={60} title="Plan" sub="agent proposes steps" tone="rust" />
      <Arrow d="M 320 110 L 362 110" />
      <Node x={366} y={80} w={156} h={60} title="Agent writes code" tone="rust" />
      <Arrow d="M 522 110 L 564 110" />
      <Node
        x={568}
        y={80}
        w={168}
        h={60}
        title="Tests + linters"
        sub="the objective referee"
        tone="amber"
      />
      <Arrow
        d="M 568 128 C 540 156, 500 156, 460 144"
        tone="indigo"
        dashed
        label="failures → fix"
        lx={512}
        ly={172}
      />
      <Arrow d="M 652 140 L 652 216" tone="teal" label="green" lx={676} ly={182} />
      <Node x={568} y={220} w={168} h={60} title="Human review" sub="architecture & intent" />
      <Arrow d="M 564 250 L 526 250" tone="teal" />
      <Node x={366} y={220} w={156} h={60} title="Merge & deploy" tone="teal" />
      <Arrow
        d="M 610 220 C 560 190, 500 170, 470 148"
        tone="plum"
        dashed
        label="feedback"
        lx={528}
        ly={196}
      />
      <Zone x={24} y={318} w={712} h={106} label="Context the agent needs" tone="plum" />
      <Chip x={48} y={362} text="codebase search" tone="plum" />
      <Chip x={186} y={362} text="docs & conventions" tone="plum" />
      <Chip x={344} y={362} text="failing test output" tone="plum" />
      <Chip x={492} y={362} text="runtime logs" tone="plum" />
      <Chip x={600} y={362} text="git history" tone="plum" />
      <Arrow d="M 300 314 C 340 250, 400 180, 430 144" tone="plum" dashed />
      <Caption
        x={380}
        y={438}
        text="The human moves up the stack: from typing code to specifying, reviewing, and verifying it."
      />
    </DiagramShell>
  )
}

export function ChatAssistantDiagram() {
  return (
    <DiagramShell w={760} h={470} title="Architecture of a production chat assistant">
      <Node x={24} y={190} w={120} h={66} title="Browser" sub="renders the stream" />
      <Arrow d="M 144 223 L 186 223" label="POST /chat" lx={158} ly={178} />
      <Node x={190} y={190} w={146} h={66} title="API route" sub="auth + SSE stream" />
      <Arrow d="M 336 223 L 382 223" />
      <Node
        x={386}
        y={190}
        w={164}
        h={66}
        title="Orchestrator"
        sub="builds the prompt"
        tone="rust"
      />
      <Arrow d="M 550 223 L 602 223" tone="rust" />
      <Node x={606} y={190} w={130} h={66} title="LLM" tone="rust" />
      <Node x={140} y={330} w={150} h={60} title="Retrieval" sub="docs → context" tone="plum" />
      <Arrow d="M 240 326 C 290 296, 380 276, 428 260" tone="plum" dashed />
      <Node x={320} y={330} w={150} h={60} title="Tools" sub="actions & lookups" tone="plum" />
      <Arrow d="M 408 326 C 430 300, 448 280, 460 260" tone="plum" dashed />
      <Node
        x={500}
        y={330}
        w={160}
        h={60}
        title="Session store"
        sub="history per user"
        tone="amber"
      />
      <Arrow
        d="M 566 326 C 540 300, 522 280, 506 260"
        tone="amber"
        dashed
        label="load / append"
        lx={620}
        ly={300}
      />
      <Arrow
        d="M 671 186 C 640 60, 120 60, 88 186"
        tone="teal"
        dashed
        label="tokens stream back as they're generated"
        lx={380}
        ly={78}
      />
      <Caption
        x={380}
        y={440}
        text="Streaming hides latency; memory makes it a conversation; retrieval and tools make it useful."
      />
    </DiagramShell>
  )
}
