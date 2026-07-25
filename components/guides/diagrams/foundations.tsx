import { Arrow, C, Caption, Chip, DiagramShell, Node, Zone } from './primitives'

export function LlmConceptsDiagram() {
  return (
    <DiagramShell w={760} h={430} title="How an LLM generates text, one token at a time">
      <Node x={24} y={64} w={116} h={56} title="Prompt" sub="raw text" />
      <Arrow d="M 140 92 L 176 92" />
      <Node x={180} y={64} w={128} h={56} title="Tokenizer" sub="text → token IDs" />
      <Chip x={182} y={140} text="The" />
      <Chip x={224} y={140} text="cat" />
      <Chip x={264} y={140} text="sat" />
      <Chip x={303} y={140} text="…" />
      <Arrow d="M 308 92 L 352 92" />
      <Node
        x={356}
        y={48}
        w={160}
        h={88}
        title="Transformer"
        sub="stacked attention layers"
        tone="rust"
      />
      <Arrow d="M 516 92 L 560 92" />
      <Node x={564} y={48} w={172} h={88} title="Next token" sub="probability distribution" />
      <Chip x={568} y={146} text="mat 62%" tone="rust" />
      <Chip x={640} y={146} text="rug 21%" />
      <Chip x={568} y={172} text="hat 8%" />
      <Arrow
        d="M 640 200 C 620 256, 120 256, 83 126"
        tone="rust"
        dashed
        label="sampled token appended — loop repeats"
        lx={368}
        ly={224}
      />
      <Zone
        x={24}
        y={280}
        w={712}
        h={122}
        label="Context window — everything the model can see"
        tone="plum"
      />
      <Chip x={44} y={318} text="system prompt" tone="plum" />
      <Chip x={152} y={318} text="conversation history" tone="plum" />
      <Chip x={300} y={318} text="retrieved docs" tone="plum" />
      <Chip x={410} y={318} text="user message" tone="plum" />
      <Chip x={514} y={318} text="generated tokens so far" tone="plum" />
      <Caption
        x={380}
        y={374}
        text="A fixed token budget — when it fills up, something must be dropped, summarized, or fetched on demand."
      />
    </DiagramShell>
  )
}

export function PromptEngineeringDiagram() {
  return (
    <DiagramShell w={760} h={430} title="Anatomy of an engineered prompt">
      <Zone x={24} y={40} w={300} h={356} label="Anatomy of a prompt" tone="rust" />
      <Node x={44} y={74} w={260} h={54} title="System role" sub="who the model is, hard rules" />
      <Node x={44} y={136} w={260} h={54} title="Instructions" sub="the task, stated precisely" />
      <Node x={44} y={198} w={260} h={54} title="Examples (few-shot)" sub="input → output pairs" />
      <Node x={44} y={260} w={260} h={54} title="Context / data" sub="docs, variables, state" />
      <Node x={44} y={322} w={260} h={54} title="Output format" sub="JSON, markdown, length" />
      <Caption x={400} y={52} text="Techniques" anchor="start" tone="plum" />
      <Chip x={400} y={62} text="zero-shot" tone="plum" />
      <Chip x={478} y={62} text="few-shot" tone="plum" />
      <Chip x={552} y={62} text="chain-of-thought" tone="plum" />
      <Arrow d="M 328 218 L 396 218" tone="rust" />
      <Node x={400} y={184} w={130} h={68} title="LLM" sub="temperature, top-p" tone="rust" />
      <Arrow d="M 530 218 L 596 218" tone="rust" />
      <Node x={600} y={184} w={140} h={68} title="Response" sub="on-task, parseable" tone="teal" />
      <Caption x={540} y={300} text="Iterate like code: change one variable, re-run your evals." />
      <Caption
        x={540}
        y={320}
        text="Prompts are versioned artifacts, not magic strings."
        tone="muted"
      />
    </DiagramShell>
  )
}

export function StructuredOutputsDiagram() {
  return (
    <DiagramShell w={760} h={470} title="Structured outputs and tool calling">
      <Zone x={24} y={36} w={712} h={186} label="Structured output" tone="rust" />
      <Node x={44} y={96} w={100} h={56} title="Your app" />
      <Arrow d="M 144 124 L 216 124" label="prompt + JSON schema" lx={182} ly={88} tone="rust" />
      <Node x={220} y={96} w={110} h={56} title="LLM" sub="constrained decoding" tone="rust" />
      <Arrow d="M 330 124 L 386 124" />
      <Node x={390} y={96} w={130} h={56} title="JSON output" sub='{"name": "…"}' />
      <Arrow d="M 520 124 L 566 124" />
      <Node x={570} y={96} w={146} h={56} title="Validator" sub="Pydantic / Zod" tone="teal" />
      <Arrow
        d="M 643 152 C 643 200, 275 200, 275 156"
        tone="indigo"
        dashed
        label="on validation error: retry with the error message"
        lx={460}
        ly={180}
      />
      <Zone x={24} y={244} w={712} h={206} label="Tool calling" tone="plum" />
      <Node x={44} y={300} w={120} h={60} title="LLM" sub="decides to act" tone="plum" />
      <Arrow d="M 164 330 L 226 330" label="name + args" lx={195} ly={292} tone="plum" />
      <Node x={230} y={300} w={170} h={60} title="Tool call" sub='get_weather({"city": …})' />
      <Arrow d="M 400 330 L 456 330" />
      <Node x={460} y={300} w={130} h={60} title="Your code" sub="runs the function" />
      <Arrow d="M 590 330 L 636 330" />
      <Node x={640} y={300} w={96} h={60} title="Result" sub="JSON" tone="teal" />
      <Arrow
        d="M 688 360 C 688 424, 104 424, 104 364"
        tone="plum"
        dashed
        label="result is appended — the model continues with real data"
        lx={396}
        ly={400}
      />
    </DiagramShell>
  )
}

export function EmbeddingsDiagram() {
  return (
    <DiagramShell w={760} h={420} title="Embeddings map text into a vector space">
      <Node x={24} y={60} w={176} h={50} title="“I love my cat”" />
      <Node x={24} y={130} w={176} h={50} title="“Kittens are adorable”" />
      <Node x={24} y={200} w={176} h={50} title="“Q3 revenue grew 8%”" />
      <Arrow d="M 200 85 C 230 85, 230 130, 256 140" />
      <Arrow d="M 200 155 L 256 155" />
      <Arrow d="M 200 225 C 230 225, 230 180, 256 170" />
      <Node
        x={260}
        y={120}
        w={150}
        h={70}
        title="Embedding model"
        sub="text → vector"
        tone="rust"
      />
      <Chip x={266} y={210} text="[0.12, −0.98, 0.44, …]" tone="rust" />
      <Arrow d="M 410 155 L 486 155" tone="rust" />
      <Zone x={490} y={40} w={246} h={340} label="Vector space" tone="plum" />
      <circle cx={570} cy={140} r={7} fill={C.rust} />
      <circle cx={601} cy={168} r={7} fill={C.rust} />
      <circle cx={556} cy={185} r={7} fill={C.rust} />
      <Caption x={578} y={215} text="pets" tone="rust" />
      <circle cx={672} cy={296} r={7} fill={C.plum} />
      <circle cx={694} cy={320} r={7} fill={C.plum} />
      <circle cx={655} cy={326} r={7} fill={C.plum} />
      <Caption x={676} y={352} text="finance" tone="plum" />
      <circle cx={590} cy={110} r={8} fill="none" stroke={C.amber} strokeWidth={2} />
      <Caption x={614} y={98} text="query" tone="amber" anchor="start" />
      <Arrow d="M 588 118 L 574 132" tone="amber" dashed />
      <Arrow d="M 596 118 L 600 158" tone="amber" dashed />
      <Caption
        x={380}
        y={400}
        text="Distance between vectors ≈ similarity of meaning. Search, clustering, and RAG are built on this."
      />
    </DiagramShell>
  )
}
