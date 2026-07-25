import { Arrow, C, Caption, DiagramShell, Node, Zone } from './primitives'

export function EvalsDiagram() {
  return (
    <DiagramShell w={760} h={450} title="The eval loop: dataset, graders, metrics, iterate">
      <Caption
        x={380}
        y={30}
        text="Evals are unit tests for model behaviour — run them on every change."
        size={12}
      />
      <Node x={24} y={80} w={146} h={66} title="Eval dataset" sub="cases + expected" tone="rust" />
      <Arrow d="M 170 113 L 212 113" />
      <Node x={216} y={80} w={158} h={66} title="System under test" sub="prompt / RAG / agent" />
      <Arrow d="M 374 113 L 416 113" />
      <Node x={420} y={80} w={120} h={66} title="Outputs" />
      <Arrow d="M 540 113 L 576 113" />
      <Zone x={580} y={40} w={156} h={244} label="Graders" tone="plum" />
      <Node x={596} y={92} w={124} h={48} title="Code checks" sub="exact, regex, schema" />
      <Node x={596} y={152} w={124} h={48} title="LLM judge" sub="rubric scoring" />
      <Node x={596} y={212} w={124} h={48} title="Human review" sub="spot checks" />
      <Arrow d="M 658 284 C 658 352, 610 352, 592 352" tone="plum" />
      <Node
        x={420}
        y={322}
        w={168}
        h={62}
        title="Scores & metrics"
        sub="accuracy, faithfulness, cost"
        tone="teal"
      />
      <Arrow
        d="M 416 352 C 300 352, 295 210, 295 150"
        tone="amber"
        dashed
        label="fix the biggest failure mode, re-run"
        lx={300}
        ly={392}
      />
      <Caption
        x={380}
        y={432}
        text="Without evals, every prompt tweak is a guess; with them, it's engineering."
      />
    </DiagramShell>
  )
}

export function GuardrailsDiagram() {
  return (
    <DiagramShell w={760} h={440} title="Layered guardrails around an LLM">
      <Node
        x={390}
        y={40}
        w={176}
        h={56}
        title="Human approval"
        sub="for high-risk actions"
        dashed
        tone="amber"
      />
      <Arrow d="M 456 96 L 440 146" tone="amber" dashed />
      <Node x={24} y={170} w={104} h={56} title="User" />
      <Arrow d="M 128 198 L 164 198" />
      <Node
        x={168}
        y={150}
        w={172}
        h={96}
        title="Input guards"
        sub="injection, PII, topic scope"
        tone="amber"
      />
      <Arrow d="M 340 198 L 384 198" />
      <Node x={388} y={170} w={114} h={56} title="LLM" tone="rust" />
      <Arrow d="M 502 198 L 544 198" />
      <Node
        x={548}
        y={150}
        w={188}
        h={96}
        title="Output guards"
        sub="schema, moderation, grounding"
        tone="amber"
      />
      <Arrow d="M 640 246 C 640 348, 580 348, 568 348" tone="teal" />
      <Node x={388} y={320} w={176} h={56} title="Response" sub="validated & safe" tone="teal" />
      <Arrow d="M 254 246 L 254 316" tone="indigo" dashed label="blocked" lx={228} ly={284} />
      <Node
        x={168}
        y={320}
        w={172}
        h={56}
        title="Safe fallback"
        sub="refuse or clarify"
        tone="indigo"
      />
      <Arrow d="M 548 240 C 480 290, 400 306, 348 320" tone="indigo" dashed />
      <Caption
        x={380}
        y={416}
        text="Defence in depth: no single check is reliable, so stack cheap ones at every boundary."
      />
    </DiagramShell>
  )
}

export function SystemDesignDiagram() {
  return (
    <DiagramShell w={760} h={480} title="Reference architecture for an LLM system">
      <Node x={24} y={200} w={104} h={60} title="Client" sub="web, mobile" />
      <Arrow d="M 128 230 L 164 230" />
      <Node x={168} y={200} w={134} h={60} title="API gateway" sub="auth, rate limits" />
      <Arrow d="M 302 230 L 344 230" />
      <Node
        x={348}
        y={200}
        w={156}
        h={60}
        title="Orchestrator"
        sub="prompts, RAG, agents"
        tone="rust"
      />
      <Arrow d="M 504 230 L 546 230" />
      <Node
        x={550}
        y={200}
        w={186}
        h={60}
        title="Model gateway"
        sub="routing, fallbacks, retries"
        tone="plum"
      />
      <Arrow d="M 643 260 L 643 296" tone="plum" />
      <Node x={550} y={300} w={186} h={56} title="Providers" sub="Claude · GPT · self-hosted" />
      <Node
        x={348}
        y={80}
        w={156}
        h={56}
        title="Semantic cache"
        sub="repeat queries → free"
        tone="teal"
      />
      <Arrow d="M 426 136 L 426 196" tone="teal" dashed />
      <Node x={168} y={300} w={134} h={56} title="Vector DB" sub="retrieval" tone="amber" />
      <Arrow d="M 302 328 C 340 320, 380 290, 410 264" tone="amber" dashed />
      <rect
        x={24}
        y={396}
        width={712}
        height={54}
        rx={10}
        fill="none"
        stroke={C.teal}
        strokeOpacity={0.5}
        strokeDasharray="6 5"
      />
      <Caption
        x={380}
        y={423}
        text="Observability — traces, token cost, latency, and eval scores on every request"
        tone="teal"
        size={11.5}
      />
      <Arrow d="M 235 356 L 235 392" tone="teal" dashed />
      <Arrow d="M 426 260 C 426 320, 426 360, 426 392" tone="teal" dashed />
      <Arrow d="M 643 356 L 643 392" tone="teal" dashed />
    </DiagramShell>
  )
}

export function DeploymentDiagram() {
  return (
    <DiagramShell w={760} h={440} title="Shipping AI systems: CI, canary, monitoring">
      <Caption
        x={380}
        y={30}
        text="Ship agents like software — but gate releases on evals, not just unit tests."
        size={12}
      />
      <Node x={24} y={70} w={122} h={60} title="Code + prompts" sub="one repo, versioned" />
      <Arrow d="M 146 100 L 182 100" />
      <Node
        x={186}
        y={60}
        w={160}
        h={78}
        title="CI pipeline"
        sub="tests + eval gate"
        tone="amber"
      />
      <Arrow d="M 346 100 L 388 100" label="pass" lx={367} ly={88} tone="teal" />
      <Node x={392} y={70} w={140} h={60} title="Container" sub="FastAPI + Docker" />
      <Arrow d="M 532 100 L 568 100" />
      <Node x={572} y={60} w={164} h={78} title="Canary deploy" sub="5% → 50% → 100%" tone="rust" />
      <Arrow d="M 654 138 L 654 216" tone="rust" />
      <Node
        x={572}
        y={220}
        w={164}
        h={70}
        title="Monitoring"
        sub="latency, cost, quality drift"
        tone="teal"
      />
      <Arrow d="M 568 250 L 536 250" tone="indigo" dashed />
      <Node
        x={392}
        y={222}
        w={140}
        h={56}
        title="Rollback"
        sub="automatic on regression"
        tone="indigo"
      />
      <Arrow d="M 462 222 C 462 170, 530 130, 568 116" tone="indigo" dashed />
      <Arrow
        d="M 572 280 C 300 340, 120 300, 85 134"
        tone="muted"
        dashed
        label="production traces become new eval cases"
        lx={330}
        ly={330}
      />
      <Caption
        x={380}
        y={412}
        text="The loop closes: real failures feed the eval set, which gates the next release."
      />
    </DiagramShell>
  )
}

export function FinetuningDiagram() {
  return (
    <DiagramShell w={760} h={450} title="From base model to aligned model">
      <Node x={24} y={70} w={132} h={60} title="Base model" sub="next-token predictor" />
      <Arrow d="M 156 100 L 200 100" />
      <Node
        x={204}
        y={70}
        w={168}
        h={60}
        title="Supervised fine-tune"
        sub="labeled demonstrations"
        tone="rust"
      />
      <Arrow d="M 372 100 L 424 100" />
      <Node x={428} y={70} w={160} h={60} title="Preference data" sub="humans rank outputs" />
      <Arrow d="M 508 130 L 508 176" />
      <Node
        x={428}
        y={180}
        w={160}
        h={60}
        title="Reward model"
        sub="predicts preference"
        tone="plum"
      />
      <Arrow d="M 424 210 L 384 210" tone="plum" />
      <Node
        x={204}
        y={180}
        w={176}
        h={60}
        title="RL optimisation"
        sub="PPO · or DPO directly"
        tone="plum"
      />
      <Arrow d="M 288 130 L 288 176" dashed />
      <Arrow d="M 200 210 L 168 210" tone="teal" />
      <Node x={24} y={180} w={140} h={60} title="Aligned model" sub="helpful & safe" tone="teal" />
      <Zone x={24} y={296} w={712} h={130} label="When should you fine-tune?" tone="amber" />
      <Caption
        x={380}
        y={344}
        text="✓ Style, tone, and format the model keeps getting wrong · ✓ distilling a big model into a cheaper one"
      />
      <Caption
        x={380}
        y={366}
        text="✗ Injecting fresh knowledge — use RAG · ✗ before you've exhausted prompting + evals"
      />
      <Caption
        x={380}
        y={402}
        text="DPO skips the reward model by optimising on preference pairs directly."
        tone="muted"
      />
    </DiagramShell>
  )
}
