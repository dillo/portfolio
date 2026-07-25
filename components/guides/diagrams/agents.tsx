import { Arrow, C, Caption, Chip, DiagramShell, Node, Zone, hex } from './primitives'

export function AgentLoopDiagram() {
  return (
    <DiagramShell w={760} h={440} title="The agent loop: reason, act, observe">
      <Caption
        x={380}
        y={32}
        text="The agent loop — the model keeps choosing actions until the task is done."
        size={12}
      />
      <Node x={24} y={192} w={110} h={56} title="Task" sub="user goal" />
      <Arrow d="M 134 220 L 186 220" />
      <Node
        x={190}
        y={180}
        w={170}
        h={80}
        title="LLM reasons"
        sub="what should I do next?"
        tone="rust"
      />
      <Arrow
        d="M 360 196 C 410 160, 430 130, 464 104"
        tone="plum"
        label="choose a tool"
        lx={380}
        ly={130}
      />
      <Node x={468} y={60} w={170} h={64} title="Act" sub="search, code, API call" tone="plum" />
      <Arrow
        d="M 638 92 C 716 92, 716 330, 642 330"
        tone="plum"
        label="execute"
        lx={732}
        ly={214}
      />
      <Node x={468} y={300} w={170} h={64} title="Observation" sub="tool result, error, data" />
      <Arrow
        d="M 464 330 C 420 330, 400 290, 366 254"
        tone="rust"
        label="append to context"
        lx={392}
        ly={312}
      />
      <Arrow d="M 275 260 L 275 336" tone="teal" label="task complete" lx={275} ly={288} />
      <Node x={190} y={340} w={170} h={60} title="Final answer" tone="teal" />
      <Caption
        x={380}
        y={424}
        text="Every loop iteration re-reads the whole context — observations become part of the prompt."
      />
    </DiagramShell>
  )
}

export function AgenticPatternsDiagram() {
  return (
    <DiagramShell w={760} h={460} title="Four core agentic patterns">
      <Zone x={24} y={40} w={340} h={190} label="Reflection" tone="rust" />
      <Node x={40} y={110} w={90} h={46} title="Generate" />
      <Arrow d="M 130 133 L 146 133" tone="rust" />
      <Node x={150} y={110} w={90} h={46} title="Critique" tone="rust" />
      <Arrow d="M 240 133 L 256 133" tone="rust" />
      <Node x={260} y={110} w={90} h={46} title="Revise" />
      <Arrow
        d="M 305 156 C 305 194, 85 194, 85 160"
        tone="rust"
        dashed
        label="loop until good"
        lx={195}
        ly={176}
      />
      <Caption x={194} y={216} text="The model reviews its own work" />
      <Zone x={396} y={40} w={340} h={190} label="Tool use" tone="plum" />
      <Node x={420} y={110} w={100} h={46} title="LLM" tone="plum" />
      <Arrow d="M 520 122 L 576 122" tone="plum" label="call" lx={548} ly={112} />
      <Arrow d="M 576 144 L 520 144" tone="plum" label="result" lx={548} ly={162} />
      <Node x={580} y={110} w={136} h={46} title="Tools" sub="APIs, search, code" />
      <Caption x={566} y={216} text="Reach beyond the training data" />
      <Zone x={24} y={250} w={340} h={190} label="Planning" tone="amber" />
      <Node x={40} y={320} w={86} h={46} title="Task" />
      <Arrow d="M 126 343 L 142 343" tone="amber" />
      <Node x={146} y={320} w={100} h={46} title="Plan" sub="steps 1…n" tone="amber" />
      <Arrow d="M 246 343 L 262 343" tone="amber" />
      <Node x={266} y={320} w={84} h={46} title="Execute" />
      <Caption x={194} y={412} text="Decompose before doing" />
      <Zone x={396} y={250} w={340} h={190} label="Multi-agent" tone="teal" />
      <Node x={506} y={288} w={120} h={44} title="Supervisor" tone="teal" />
      <Arrow d="M 540 332 L 490 366" tone="teal" />
      <Arrow d="M 592 332 L 642 366" tone="teal" />
      <Node x={420} y={370} w={110} h={44} title="Researcher" />
      <Node x={600} y={370} w={110} h={44} title="Writer" />
      <Caption x={566} y={430} text="Specialists split the work" size={10.5} />
    </DiagramShell>
  )
}

export function AgentDesignDiagram() {
  return (
    <DiagramShell w={760} h={460} title="The anatomy of a well-designed agent">
      <Node
        x={290}
        y={190}
        w={180}
        h={84}
        title="Agent core"
        sub="LLM + system prompt"
        tone="rust"
      />
      <Node x={60} y={60} w={160} h={64} title="Tools" sub="typed, documented, few" tone="plum" />
      <Node x={540} y={60} w={160} h={64} title="Memory" sub="state across turns" tone="amber" />
      <Node
        x={60}
        y={340}
        w={160}
        h={64}
        title="Guardrails"
        sub="budgets & approvals"
        tone="indigo"
      />
      <Node
        x={540}
        y={340}
        w={160}
        h={64}
        title="Observability"
        sub="trace every step"
        tone="teal"
      />
      <Arrow d="M 200 124 C 240 150, 260 168, 296 186" tone="plum" label="act" lx={224} ly={166} />
      <Arrow d="M 320 186 C 290 174, 270 160, 240 140" tone="plum" dashed />
      <Arrow
        d="M 560 124 C 520 150, 500 168, 464 186"
        tone="amber"
        label="recall / save"
        lx={540}
        ly={166}
      />
      <Arrow
        d="M 200 340 C 240 314, 260 296, 296 278"
        tone="indigo"
        label="limits"
        lx={224}
        ly={300}
      />
      <Arrow d="M 464 278 C 500 296, 520 314, 560 340" tone="teal" label="logs" lx={536} ly={300} />
      <Caption
        x={380}
        y={430}
        text="Start with one model, a handful of great tools, and hard limits — add structure only when evals demand it."
      />
    </DiagramShell>
  )
}

export function AgentMemoryDiagram() {
  return (
    <DiagramShell w={760} h={460} title="Short-term versus long-term agent memory">
      <Node x={36} y={196} w={148} h={72} title="Agent (LLM)" tone="rust" />
      <Zone
        x={240}
        y={40}
        w={496}
        h={172}
        label="Short-term · inside the context window"
        tone="rust"
      />
      <Node x={264} y={96} w={140} h={48} title="Recent messages" />
      <Node x={420} y={96} w={150} h={48} title="Scratchpad / plan" />
      <Node x={586} y={96} w={130} h={48} title="Tool results" />
      <Caption x={488} y={182} text="fast and cheap — but evaporates when the window fills" />
      <Zone x={240} y={252} w={496} h={182} label="Long-term · external stores" tone="plum" />
      <Node x={264} y={308} w={140} h={56} title="Vector store" sub="episodic memories" />
      <Node x={420} y={308} w={150} h={56} title="Profile / KV" sub="facts & preferences" />
      <Node x={586} y={308} w={130} h={56} title="Files" sub="notes, documents" />
      <Caption x={488} y={408} text="durable — retrieved back into context only when relevant" />
      <Arrow
        d="M 184 212 C 210 190, 214 160, 236 140"
        tone="rust"
        label="read / write every turn"
        lx={148}
        ly={148}
      />
      <Arrow
        d="M 184 252 C 210 280, 214 300, 236 316"
        tone="plum"
        label="save summaries"
        lx={146}
        ly={300}
      />
      <Arrow
        d="M 236 348 C 190 348, 150 320, 118 272"
        tone="plum"
        dashed
        label="retrieve on demand"
        lx={166}
        ly={378}
      />
    </DiagramShell>
  )
}

export function ContextEngineeringDiagram() {
  const segs = [
    { x: 40, w: 90, tone: 'rust', label: 'System' },
    { x: 130, w: 110, tone: 'plum', label: 'Tool defs' },
    { x: 240, w: 150, tone: 'amber', label: 'Retrieved docs' },
    { x: 390, w: 180, tone: 'teal', label: 'History' },
    { x: 570, w: 90, tone: 'indigo', label: 'User task' },
  ] as const
  return (
    <DiagramShell w={760} h={430} title="Context engineering: managing the token budget">
      <Caption
        x={380}
        y={48}
        text="One context window — a hard token budget you must spend deliberately"
        size={12}
      />
      {segs.map((s) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y={80}
            width={s.w}
            height={56}
            fill={hex(s.tone)}
            fillOpacity={0.16}
            stroke={hex(s.tone)}
            strokeOpacity={0.6}
          />
          <text
            x={s.x + s.w / 2}
            y={108}
            textAnchor="middle"
            dominantBaseline="central"
            fill={hex(s.tone)}
            fontSize={11}
            fontWeight={600}
          >
            {s.label}
          </text>
        </g>
      ))}
      <rect
        x={660}
        y={80}
        width={60}
        height={56}
        fill="none"
        stroke={C.faint}
        strokeDasharray="5 4"
      />
      <text
        x={690}
        y={108}
        textAnchor="middle"
        dominantBaseline="central"
        fill={C.muted}
        fontSize={10}
      >
        output
      </text>
      <Zone x={40} y={220} w={213} h={150} label="Compaction" tone="teal" />
      <Caption x={146} y={264} text="Summarize old turns into a" />
      <Caption x={146} y={280} text="short brief; keep decisions," />
      <Caption x={146} y={296} text="drop the play-by-play." />
      <Zone x={273} y={220} w={213} h={150} label="Just-in-time retrieval" tone="amber" />
      <Caption x={379} y={264} text="Don't preload everything —" />
      <Caption x={379} y={280} text="fetch docs and memories" />
      <Caption x={379} y={296} text="the moment they're needed." />
      <Zone x={506} y={220} w={213} h={150} label="Pruning" tone="plum" />
      <Caption x={612} y={264} text="Evict stale tool results and" />
      <Caption x={612} y={280} text="irrelevant context; noise" />
      <Caption x={612} y={296} text="degrades reasoning." />
      <Arrow d="M 146 216 C 200 190, 330 160, 440 140" tone="teal" dashed />
      <Arrow d="M 379 216 C 360 190, 330 170, 310 140" tone="amber" dashed />
      <Arrow d="M 612 216 C 560 190, 500 170, 470 140" tone="plum" dashed />
      <Caption
        x={380}
        y={404}
        text="Treat attention as a scarce resource: the smallest set of high-signal tokens wins."
      />
    </DiagramShell>
  )
}

export function MultiAgentDiagram() {
  return (
    <DiagramShell w={760} h={460} title="Supervisor and pipeline multi-agent patterns">
      <Zone x={24} y={40} w={340} h={390} label="Supervisor pattern" tone="rust" />
      <Node
        x={110}
        y={96}
        w={170}
        h={60}
        title="Supervisor"
        sub="routes & owns the plan"
        tone="rust"
      />
      <Arrow
        d="M 150 156 C 110 190, 95 210, 85 226"
        tone="rust"
        label="delegate"
        lx={92}
        ly={192}
      />
      <Arrow d="M 195 156 L 195 226" tone="rust" />
      <Arrow d="M 240 156 C 280 190, 295 210, 305 226" tone="rust" />
      <Node x={40} y={230} w={94} h={56} title="Researcher" />
      <Node x={148} y={230} w={94} h={56} title="Coder" />
      <Node x={256} y={230} w={94} h={56} title="Critic" />
      <Arrow d="M 195 286 L 195 330" tone="muted" dashed />
      <Arrow d="M 87 286 C 120 330, 160 340, 186 342" tone="muted" dashed />
      <Arrow
        d="M 303 286 C 270 330, 230 340, 204 342"
        tone="muted"
        dashed
        label="results"
        lx={280}
        ly={334}
      />
      <Node x={110} y={334} w={170} h={56} title="Merged answer" tone="teal" />
      <Caption x={194} y={416} text="One router owns the plan; workers stay small and focused." />
      <Zone x={396} y={40} w={340} h={390} label="Pipeline pattern" tone="plum" />
      <Node x={500} y={86} w={140} h={56} title="Planner" sub="break down the task" tone="plum" />
      <Arrow d="M 570 142 L 570 182" tone="plum" label="plan" lx={594} ly={166} />
      <Node x={500} y={186} w={140} h={56} title="Executor" sub="do the steps" />
      <Arrow d="M 570 242 L 570 282" tone="plum" label="draft" lx={594} ly={266} />
      <Node x={500} y={286} w={140} h={56} title="Critic" sub="gate on quality" tone="amber" />
      <Arrow
        d="M 500 314 C 440 314, 440 114, 496 114"
        tone="indigo"
        dashed
        label="revise"
        lx={428}
        ly={218}
      />
      <Arrow d="M 570 342 L 570 376" tone="teal" />
      <Caption x={570} y={392} text="ship when the critic passes" tone="teal" />
      <Caption x={566} y={416} text="Stages hand off artifacts; a critic gates what ships." />
    </DiagramShell>
  )
}

export function McpDiagram() {
  return (
    <DiagramShell w={760} h={470} title="How the Model Context Protocol connects hosts to servers">
      <Zone x={24} y={60} w={264} h={330} label="MCP host" tone="rust" />
      <Node
        x={44}
        y={116}
        w={224}
        h={64}
        title="AI app"
        sub="Claude, IDE, your agent"
        tone="rust"
      />
      <Arrow d="M 156 180 L 156 216" tone="rust" />
      <Node x={44} y={220} w={224} h={56} title="MCP client" sub="one connection per server" />
      <Caption x={156} y={330} text="The app discovers what each" />
      <Caption x={156} y={346} text="server offers at runtime —" />
      <Caption x={156} y={362} text="no hardcoded integrations." />
      <Arrow d="M 268 236 C 320 200, 330 150, 366 122" tone="plum" />
      <Arrow d="M 268 248 L 366 248" tone="plum" />
      <Caption x={156} y={300} text="JSON-RPC · stdio / HTTP" tone="plum" />
      <Arrow d="M 268 260 C 320 296, 330 346, 366 374" tone="plum" />
      <Zone x={370} y={40} w={366} h={390} label="MCP servers" tone="plum" />
      <Node x={390} y={94} w={168} h={56} title="GitHub server" sub="issues, PRs, search" />
      <Node x={390} y={220} w={168} h={56} title="Postgres server" sub="query, schema" />
      <Node x={390} y={346} w={168} h={56} title="Filesystem server" sub="read, write, watch" />
      <Chip x={576} y={100} text="tools" tone="rust" />
      <Chip x={632} y={100} text="resources" tone="amber" />
      <Chip x={576} y={126} text="prompts" tone="teal" />
      <Chip x={576} y={226} text="tools" tone="rust" />
      <Chip x={632} y={226} text="resources" tone="amber" />
      <Chip x={576} y={352} text="tools" tone="rust" />
      <Caption
        x={380}
        y={456}
        text="One open protocol replaces N×M custom integrations between apps and data sources."
      />
    </DiagramShell>
  )
}
