import type { Lesson } from '../types'

export const agents: Lesson[] = [
  {
    slug: 'how-ai-agents-work',
    title: 'How AI Agents Work',
    tagline: 'The loop that turns a text predictor into a system that acts',
    intro:
      'An agent is not a new kind of model — it is an ordinary LLM placed in a loop where it can choose actions, see their results, and keep going until a goal is met. Once you see the loop, every agent framework becomes legible.',
    module: 'agents',
    minutes: 8,
    sections: [
      {
        heading: 'From one-shot answers to a loop',
        blocks: [
          {
            kind: 'p',
            text: 'A plain LLM call is a single pass: prompt in, text out. An **agent** wraps that call in a loop: the model reads the task, *reasons* about what to do next, *acts* by emitting a tool call, your runtime executes it, and the *observation* — result, error, data — is appended to the context. The model then reasons again with new information. The loop exits when the model decides the task is done (or a budget runs out).',
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Definition worth keeping',
            text: 'Agent = LLM + tools + loop + stop condition. Everything else — memory, planning, multi-agent — is elaboration on those four parts.',
          },
        ],
      },
      {
        heading: 'What the loop changes',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Fresh information**: the model can look things up instead of recalling them.',
              '**Verification**: it can run code, check results, and fix its own errors — turning one-shot guesses into iterate-until-correct.',
              '**Decomposition**: hard tasks become sequences of easy tool calls.',
              "**Real effects**: with write-capable tools, the loop doesn't just answer — it does.",
            ],
          },
          {
            kind: 'p',
            text: "That last point is why agents demand engineering discipline. The gap between 'chatbot that suggests a fix' and 'agent that deploys one' is exactly the gap between read-only and write-capable tools.",
          },
        ],
      },
      {
        heading: 'A concrete trace',
        blocks: [
          {
            kind: 'p',
            text: 'Task: "Why did checkout latency spike yesterday?" A competent agent\'s loop might read: query the metrics API for p99 latency (observe: spike at 14:20 UTC) → search deploy logs around that time (observe: payments-service v2.31 shipped 14:15) → fetch that deploy\'s diff (observe: N+1 query introduced) → answer with the culprit commit, evidence, and a suggested fix. Four reasoning steps, three tool calls, zero human intervention — but every step visible in the trace.',
          },
        ],
      },
      {
        heading: 'Why agents fail, and what contains it',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Compounding errors**: at 95% per-step reliability, a 10-step task succeeds ~60% of the time. Fewer, more reliable steps beat long fragile chains.',
              '**Context bloat**: every observation lands in the window; a huge tool result can drown the actual task.',
              '**Loops and stalls**: models retry failed approaches verbatim or wander. Budgets (max steps, max cost, timeouts) are mandatory, not optional.',
              '**Runaway actions**: an agent that can write needs approval gates for irreversible operations.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'Trace everything',
            text: 'An agent without step-level logging is undebuggable. Record every reasoning step, tool call, and observation — you will need the trace the first time an agent does something inexplicable, which is week one.',
          },
        ],
      },
    ],
    takeaways: [
      'Agent = LLM + tools + loop + stop condition; reason → act → observe until done.',
      'The loop buys freshness, verification, and real-world effect — and inherits real-world risk.',
      'Per-step errors compound: shorter, more reliable loops beat long fragile ones.',
      'Budgets on steps, cost, and time are mandatory; approval gates guard irreversible actions.',
      'Step-level traces are the difference between debugging and guessing.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — building effective agents',
        url: 'https://www.anthropic.com/research/building-effective-agents',
      },
      { label: 'ReAct paper', url: 'https://arxiv.org/abs/2210.03629' },
    ],
  },
  {
    slug: 'agentic-patterns-101',
    title: 'Agentic Patterns 101',
    tagline: 'Four composable patterns behind every agent framework',
    intro:
      "Underneath every agent framework's branding sit the same four patterns: reflection, tool use, planning, and multi-agent collaboration. Learn them as patterns — when each helps, what each costs — and you can evaluate any framework in an afternoon.",
    module: 'agents',
    minutes: 8,
    sections: [
      {
        heading: 'Reflection — the model reviews its own work',
        blocks: [
          {
            kind: 'p',
            text: 'Generate a draft, then ask the model (or a second prompt) to critique it against explicit criteria, then revise. Drafting and judging are different cognitive tasks, and models are meaningfully better at judging — so the critique catches errors the generation missed. Reflection shines on code, structured documents, and anything with checkable criteria; it costs 2–3× the calls, so gate it behind cases where quality matters.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Grounded critiques beat vague ones',
            text: '"Review this against the rubric: correctness, edge cases, style" outperforms "make it better". Best of all is objective feedback — run the tests and feed failures back in.',
          },
        ],
      },
      {
        heading: 'Tool use — reach beyond the weights',
        blocks: [
          {
            kind: 'p',
            text: 'Covered in depth in Foundations: the model emits structured calls, your code executes. As a *pattern*, the design question is which capabilities to grant. Each tool expands what the agent can do and what can go wrong — a read-only search tool and a `delete_records` tool are different risk classes, and your authorization design should treat them differently.',
          },
        ],
      },
      {
        heading: 'Planning — decompose before doing',
        blocks: [
          {
            kind: 'p',
            text: 'For multi-step goals, have the model produce an explicit plan first, then execute steps — re-planning when observations contradict assumptions. The plan is legible (humans can approve it before execution) and keeps long tasks on track. The trap is over-planning: rigid upfront plans crumble on contact with reality, so treat plans as living documents, and skip the pattern entirely for tasks a single loop handles.',
          },
        ],
      },
      {
        heading: 'Multi-agent — specialists over a generalist',
        blocks: [
          {
            kind: 'p',
            text: 'Split the work across focused agents — a researcher, a writer, a critic — each with its own prompt, tools, and context window. The real win is **context isolation**: each agent sees only what its job needs, instead of one bloated window carrying everything. The cost is coordination overhead and new failure modes between agents; it gets a full lesson later in this track.',
          },
        ],
      },
      {
        heading: 'Composing them',
        blocks: [
          {
            kind: 'p',
            text: 'The patterns nest naturally: a planner decomposes, executors use tools, a reflection step gates each result. That is essentially every commercial agent product, described in four words. Adopt patterns one at a time, only when evals show the simpler system falling short — each addition multiplies calls, latency, and surface area for bugs.',
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Frameworks are pattern packaging',
            text: 'LangGraph, CrewAI, AutoGen and friends differ mainly in how they wire these four patterns. Learn the patterns first and frameworks become interchangeable tooling choices, not identities.',
          },
        ],
      },
    ],
    takeaways: [
      'Four patterns cover the space: reflection, tool use, planning, multi-agent.',
      'Reflection works because judging is easier than generating — ground critiques in rubrics or tests.',
      'Plans should be explicit, approvable, and revisable — not rigid scripts.',
      "Multi-agent's real benefit is context isolation, not anthropomorphic teamwork.",
      'Add patterns only when evals demand them; each one multiplies cost and failure modes.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — building effective agents',
        url: 'https://www.anthropic.com/research/building-effective-agents',
      },
    ],
  },
  {
    slug: 'ai-agent-design',
    title: 'AI Agent Design',
    tagline: 'Designing agents that are reliable, debuggable, and safe',
    intro:
      'Anyone can wire a model to tools and call it an agent. Designing one that survives production means deciding deliberately about scope, tools, autonomy, and failure — before the incident, not after.',
    module: 'agents',
    minutes: 9,
    sections: [
      {
        heading: 'Start from the job, not the architecture',
        blocks: [
          {
            kind: 'p',
            text: "The first design decision is scope: what exactly is this agent responsible for, and what is explicitly out of bounds? 'Handles refund requests under $500 against the orders API' is a designable agent; 'helps with customer support' is a demo. Narrow scope makes every downstream decision easier — which tools, which guardrails, which evals — and narrow agents compose into broad systems later.",
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'The workflow-first question',
            text: "Before building an agent, ask: could this be a fixed workflow with an LLM call at each step? Workflows are cheaper, more predictable, and easier to debug. Reserve genuine agent loops for tasks where the path truly can't be scripted in advance.",
          },
        ],
      },
      {
        heading: 'The tool surface is the design',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Few and sharp**: a handful of well-described tools beats twenty overlapping ones. Tool confusion is a top failure mode.',
              '**Right altitude**: `resolve_ticket(id, resolution)` beats making the agent choreograph five low-level CRUD calls. Design tools at the level of intent.',
              '**Informative failures**: error strings that explain what went wrong and what valid input looks like let the agent self-correct instead of flailing.',
              '**Least privilege**: read-only by default; write access granted per tool, per environment, with logging.',
            ],
          },
        ],
      },
      {
        heading: 'Choose the autonomy level explicitly',
        blocks: [
          {
            kind: 'p',
            text: "Autonomy is a dial, not a binary. A useful ladder: (1) the agent *suggests*, a human executes; (2) the agent *executes read-only* work and drafts writes for approval; (3) the agent *executes writes* with human approval for irreversible ones; (4) full autonomy within hard budgets. Climb the ladder as evals and production history earn trust — don't start at 4 because the demo went well.",
          },
          {
            kind: 'p',
            text: "Whatever the level, enforce **hard budgets** in the runtime: maximum steps, maximum spend, wall-clock timeout. These are the brakes that turn 'agent stuck in a loop' from an outage into a log line.",
          },
        ],
      },
      {
        heading: 'Design for failure and for debugging',
        blocks: [
          {
            kind: 'p',
            text: "Assume steps will fail and the model will sometimes be wrong. Decide upfront: which errors does the agent retry, which does it route around, which escalate to a human? Escalation is a feature, not an admission of defeat — 'I've hit my budget; here's what I found and where I'm stuck' preserves user trust in a way silent failure never does.",
          },
          {
            kind: 'list',
            items: [
              'Trace every step: reasoning, tool call, arguments, observation, tokens, cost.',
              'Make runs reproducible: log the full context so any failure can be replayed.',
              'Keep the system prompt in version control; it is load-bearing code.',
              'Write evals per capability — not one giant end-to-end test that fails uninformatively.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'The simplicity razor',
            text: 'Every element — extra tool, extra step, extra agent — must justify itself in eval results. The best-performing production agents are almost always simpler than their first design.',
          },
        ],
      },
    ],
    takeaways: [
      'Scope narrowly: a designable agent has an explicit job and explicit non-goals.',
      'Prefer workflows when the path is scriptable; reserve agent loops for genuinely open-ended tasks.',
      'Design tools at the altitude of intent, with informative errors and least privilege.',
      'Set the autonomy level deliberately and enforce budgets in the runtime, not the prompt.',
      'Traceability and per-capability evals are what make an agent operable in production.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — writing tools for agents',
        url: 'https://www.anthropic.com/engineering/writing-tools-for-agents',
      },
    ],
  },
  {
    slug: 'agent-memory-and-state',
    title: 'Agent Memory & State',
    tagline: 'What the agent remembers — and what it should forget',
    intro:
      'A stateless model in a stateful world needs memory engineered around it. The discipline is knowing what lives in the context window, what lives in external stores, and how information moves between them without drowning the model.',
    module: 'agents',
    minutes: 8,
    sections: [
      {
        heading: 'Short-term: the context window is working memory',
        blocks: [
          {
            kind: 'p',
            text: "Within a session, memory is simply what's in the context: recent messages, the agent's scratchpad and plan, and tool results. It's fast, requires no infrastructure, and needs no retrieval step — but it is finite, costs tokens on every call, and evaporates when the session ends or the window fills.",
          },
          {
            kind: 'p',
            text: 'The main short-term failure is bloat: a 200-message session where the model loses the thread. The remedy is **compaction** — periodically summarizing older turns into a compact brief (decisions made, facts learned, current state) and dropping the play-by-play. What you keep in the summary is a real design decision: keep conclusions, drop process.',
          },
        ],
      },
      {
        heading: 'Long-term: externalize, then retrieve',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Key-value / profile store** — durable facts and preferences ('prefers TypeScript', 'timezone: PT'). Cheap to read, easy to edit and audit.",
              '**Vector store** — episodic memory: past conversations and outcomes, retrieved by semantic similarity when relevant.',
              '**Files / documents** — notes the agent itself writes and re-reads: progress logs, TODO lists, research summaries. Increasingly the workhorse for long-running agents.',
              '**Structured DB** — when memories have schema (orders, tickets), ordinary tables beat clever embeddings.',
            ],
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'The core pattern',
            text: "Write summaries out; read relevant slices back in. Long-term memory is a RAG system whose corpus is the agent's own past.",
          },
        ],
      },
      {
        heading: 'The write path is the hard part',
        blocks: [
          {
            kind: 'p',
            text: "Deciding what to remember is harder than storing it. Save too little and the agent repeats questions; save too much and retrieval drowns in noise ('user said thanks' × 400). Practical approaches: let the model decide with a `save_memory` tool and clear criteria; extract asynchronously from transcripts after sessions; and always **update rather than append** when new information contradicts old — otherwise the store fills with stale facts that retrieval happily returns.",
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'Memory is user data',
            text: 'Persisted memories about users carry privacy obligations: scope them per user, make them inspectable and deletable, and treat retrieved memory as context, not as instructions — a poisoned memory is a prompt injection with persistence.',
          },
        ],
      },
      {
        heading: 'State ≠ memory',
        blocks: [
          {
            kind: 'p',
            text: "Alongside conversational memory, an agent run has *operational state*: which step it's on, pending approvals, tool results awaiting processing. This belongs in ordinary application state (a database row, a workflow engine, a state machine) — not in the prompt. Confusing the two is how systems end up asking an LLM to remember what a `status` column should assert.",
          },
        ],
      },
    ],
    takeaways: [
      'Short-term memory is the context window; compaction (summarize, drop the play-by-play) keeps it usable.',
      "Long-term memory is externalized — KV for facts, vectors for episodes, files for the agent's own notes.",
      'The write path is the design problem: save conclusions, update contradictions, prune ruthlessly.',
      'Persisted memory is user data — scoped, inspectable, deletable, and never trusted as instructions.',
      'Operational state belongs in a database, not in the prompt.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — memory & context management',
        url: 'https://www.anthropic.com/news/context-management',
      },
    ],
  },
  {
    slug: 'context-engineering',
    title: 'Context Engineering',
    tagline: "Curating the model's finite attention on every single call",
    intro:
      "Prompt engineering asks 'how do I phrase instructions?' Context engineering asks a bigger question: of everything I could put in front of the model — instructions, tools, documents, history, memories — what earns its place in this call? It has become the defining skill of agent builders.",
    module: 'agents',
    minutes: 9,
    sections: [
      {
        heading: 'Attention is the scarce resource',
        blocks: [
          {
            kind: 'p',
            text: "Context windows are large, but the model's *effective* attention is not: as context grows, recall of any given fact degrades ('context rot'), instructions buried mid-window lose force, and cost rises linearly. The guiding principle: find the **smallest set of high-signal tokens** that maximizes the likelihood of the outcome you want. Every token is spending attention; spend deliberately.",
          },
        ],
      },
      {
        heading: "Know your budget's line items",
        blocks: [
          {
            kind: 'p',
            text: "A typical agent call's window contains: the system prompt, tool definitions, retrieved documents or memories, conversation history, the current task, and headroom for output. Each is a line item you control. Audit them — teams are routinely shocked to find 40% of every call spent on tool definitions for tools the agent rarely uses, or on ancient history no longer relevant.",
          },
          {
            kind: 'list',
            items: [
              '**System prompt**: at the right altitude — specific enough to guide, not a brittle list of hundreds of edge-case rules.',
              "**Tools**: prune overlapping ones; if a router can narrow which tools a call needs, don't send the full catalog.",
              "**Retrieval**: just-in-time beats pre-loading — fetch when the task needs it, not 'in case'.",
              '**History**: compact old turns into summaries; keep decisions, drop process.',
            ],
          },
        ],
      },
      {
        heading: 'The core techniques',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Compaction** — when the window approaches its limit, summarize the trajectory and continue with the summary. What to preserve (decisions, unresolved issues, learned facts) vs discard is the craft.',
              '**Just-in-time retrieval** — maintain lightweight references (file paths, doc ids, queries) and load content at the moment of need, the way a human keeps tabs open rather than memorizing everything.',
              '**Pruning / masking** — drop or truncate stale tool results; a 5,000-token JSON blob from step 2 rarely deserves space at step 9.',
              '**Sub-agent isolation** — give exploratory work its own context window and return only the distilled conclusion to the main thread.',
              '**Structured note-taking** — the agent persists notes outside the window (a NOTES.md, a memory tool) and re-reads them after compaction; memory as a tool, not a transcript.',
            ],
          },
        ],
      },
      {
        heading: 'Debug the context, not the model',
        blocks: [
          {
            kind: 'p',
            text: "When an agent misbehaves, the first diagnostic is always: *what exactly was in the window on the failing call?* Print it. You'll find the stale instruction, the contradictory retrieved doc, the truncated tool result that ate the task, or the critical fact that fell out during compaction. Most 'the model got dumber' reports are context bugs — and context bugs are fixable by you, today, without waiting for a better model.",
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Make it inspectable',
            text: 'Build a way to dump the assembled context for any request id. It is the single highest-value debugging tool an LLM system can have.',
          },
        ],
      },
    ],
    takeaways: [
      'Effective attention is scarce even when the window is huge — curate the smallest high-signal token set.',
      'Audit the budget line items: system prompt, tools, retrieval, history, output headroom.',
      'Core moves: compaction, just-in-time retrieval, pruning, sub-agent isolation, external notes.',
      'When behaviour degrades, inspect the assembled context first — most model bugs are context bugs.',
      'Context engineering subsumes prompt engineering as systems become long-running and tool-rich.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — effective context engineering',
        url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
      },
    ],
  },
  {
    slug: 'multi-agent-architectures',
    title: 'Multi-Agent Architectures',
    tagline: "When one agent isn't enough — and the coordination tax you'll pay",
    intro:
      'Multi-agent systems split work across focused agents: a supervisor routing to specialists, or a pipeline of planner, executor, and critic. Used well they conquer context limits and parallelize work; used fashionably they multiply cost and chaos. This lesson is about knowing the difference.',
    module: 'agents',
    minutes: 8,
    sections: [
      {
        heading: 'The honest reasons to go multi-agent',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Context isolation** — the big one. Each agent gets a clean window scoped to its job; a researcher's 50 noisy search results never pollute the writer's context.",
              '**Parallelism** — independent subtasks (research five competitors) fan out concurrently and cut wall-clock time.',
              '**Separation of privilege** — the agent with database write access can be different from the one reading untrusted web content.',
              '**Focused prompts** — a 200-line do-everything system prompt becomes four sharp 30-line ones.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'The wrong reason',
            text: "Anthropomorphic appeal ('a team, like humans!') is not an architecture argument. If a single agent with good context management passes your evals, ship the single agent.",
          },
        ],
      },
      {
        heading: 'Architecture 1 — supervisor / orchestrator',
        blocks: [
          {
            kind: 'p',
            text: "A supervisor agent owns the user goal, decomposes it, dispatches subtasks to worker agents, and merges results. Workers don't talk to each other — a hub-and-spoke that keeps communication legible and debuggable. This is the default choice for heterogeneous tasks, and it degrades gracefully: with one worker, it's just an agent with a sub-agent tool.",
          },
          {
            kind: 'p',
            text: "The supervisor's craft is **task specification**: each dispatch needs a clear objective, the context the worker can't otherwise see, expected output format, and boundaries. Vague delegation produces duplicated work and gaps — the classic observed failure is workers all doing the same obvious subtask while nobody does the hard one.",
          },
        ],
      },
      {
        heading: 'Architecture 2 — pipeline (planner → executor → critic)',
        blocks: [
          {
            kind: 'p',
            text: "Sequential stages, each a different role: a planner decomposes, an executor does steps, a critic checks quality and can send work back. It's reflection formalized into structure, and it fits linear workflows with a quality gate — content production, code generation with review, report drafting. Debugging is pleasant because each stage's artifact (plan, draft, review) is inspectable.",
          },
        ],
      },
      {
        heading: 'The coordination tax',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Cost multiplies**: every agent re-reads context; multi-agent systems routinely burn several times a single agent's tokens for the same task.",
              '**Telephone-game losses**: information degrades at each handoff. The mitigation is structured handoffs — schemas, artifacts, files — not prose summaries of summaries.',
              '**Shared-state races**: two agents editing the same resource need ownership rules like any distributed system.',
              '**Debugging spans agents**: you need end-to-end traces stitched across the whole task, or failures become archaeology.',
            ],
          },
          {
            kind: 'p',
            text: "The maturity curve most teams follow: single agent → single agent with sub-agent calls for isolation → supervisor with 2–3 workers — each step taken only when evals show the simpler design failing. Teams that start at 'a society of twelve agents' invariably walk it back.",
          },
        ],
      },
    ],
    takeaways: [
      'Go multi-agent for context isolation, parallelism, and privilege separation — not for the aesthetics of teamwork.',
      'Supervisor/worker is the legible default; pipelines fit linear work with a quality gate.',
      'Delegation quality determines system quality — specify objective, context, format, boundaries.',
      'Expect the coordination tax: multiplied tokens, handoff losses, shared-state races.',
      'Escalate architecture only when evals prove the simpler design insufficient.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — multi-agent research system',
        url: 'https://www.anthropic.com/engineering/built-multi-agent-research-system',
      },
    ],
  },
  {
    slug: 'how-mcp-works',
    title: 'How MCP Works',
    tagline: 'The USB-C port for connecting AI apps to tools and data',
    intro:
      'Every AI app needs to reach tools and data; every tool used to require a custom integration per app. The Model Context Protocol (MCP) replaces that N×M mess with one open standard: build a server once, and any MCP-capable app can use it.',
    module: 'agents',
    minutes: 8,
    sections: [
      {
        heading: 'The problem MCP solves',
        blocks: [
          {
            kind: 'p',
            text: "Before MCP, connecting M apps to N data sources meant M×N bespoke integrations — the Slack plugin for one assistant couldn't serve another. MCP standardizes the interface: apps implement the protocol once as clients, integrations are built once as servers, and the ecosystem composes. It's deliberately analogous to USB-C or the Language Server Protocol.",
          },
        ],
      },
      {
        heading: 'The architecture',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Host** — the AI application (Claude, an IDE, your agent). It runs the model and decides what the model sees.',
              '**Client** — the protocol handler inside the host, one connection per server.',
              '**Server** — a program exposing capabilities from some system: GitHub, Postgres, your filesystem, an internal API. Often a small process, sometimes a remote service.',
            ],
          },
          {
            kind: 'p',
            text: 'Communication is **JSON-RPC**, over stdio for local servers or HTTP for remote ones. On connect, the client asks the server what it offers; the host surfaces those capabilities to the model. Nothing is hardcoded — the app discovers tools at runtime, which is what makes the ecosystem plug-and-play.',
          },
        ],
      },
      {
        heading: 'What a server exposes',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Tools** — functions the model can invoke (`create_issue`, `run_query`). The workhorse primitive; equivalent to tool calling, but standardized.',
              '**Resources** — data the host can read into context (files, table schemas, documents), addressed by URI.',
              '**Prompts** — reusable, parameterized prompt templates the server ships (a `/summarize-pr` command, say).',
            ],
          },
          {
            kind: 'code',
            lang: 'python',
            code: 'from mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP("orders")\n\n@mcp.tool()\ndef get_order_status(order_id: str) -> str:\n    """Look up the current status of an order, e.g. ORD-12345."""\n    return db.lookup(order_id).status\n\nmcp.run()  # serves over stdio — any MCP host can now use it',
          },
        ],
      },
      {
        heading: 'Security: the flip side of plug-and-play',
        blocks: [
          {
            kind: 'p',
            text: "An MCP server runs with real credentials and feeds text directly into a model's context — so treat servers like dependencies with production access, because that's what they are. The risks are concrete: a malicious or compromised server can exfiltrate data or inject instructions; tool descriptions themselves are prompt-injection surface; and a poisoned document fetched through a legitimate server can steer the agent.",
          },
          {
            kind: 'list',
            items: [
              'Install servers only from sources you trust, and pin versions.',
              "Scope credentials per server, least-privilege — the GitHub server doesn't need org-admin.",
              'Gate write-capable tools behind human approval in the host.',
              'Log tool calls with arguments; review what agents actually did.',
            ],
          },
        ],
      },
    ],
    takeaways: [
      'MCP turns M×N custom integrations into M+N: apps implement a client once, integrations ship as servers.',
      'Host, client, server over JSON-RPC (stdio or HTTP), with capabilities discovered at runtime.',
      'Servers expose tools (actions), resources (data), and prompts (templates).',
      'A server is a dependency with credentials — vet, pin, least-privilege, and log.',
      'Write-capable MCP tools deserve approval gates in the host, same as any agent action.',
    ],
    goDeeper: [
      { label: 'MCP specification & docs', url: 'https://modelcontextprotocol.io' },
      { label: 'MCP server registry', url: 'https://github.com/modelcontextprotocol/servers' },
    ],
  },
]
