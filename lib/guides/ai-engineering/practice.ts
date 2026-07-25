import type { Lesson } from '../types'

export const practice: Lesson[] = [
  {
    slug: 'ai-coding-workflow',
    title: 'AI Coding Workflow',
    tagline: 'Working with coding agents without shipping slop',
    intro:
      "Coding assistants went from autocomplete to agents that plan, edit across files, run tests, and open pull requests. The engineers who benefit most haven't just adopted tools — they've restructured how they work: better specs, harder tests, review as the human's main job.",
    module: 'practice',
    minutes: 8,
    sections: [
      {
        heading: 'The workflow that works',
        blocks: [
          {
            kind: 'p',
            text: 'The productive loop mirrors good delegation: write a **spec** (what and why, constraints, definition of done) → let the agent **plan** and review that plan before any code → agent **implements** → **tests and linters** referee objectively → **human review** for architecture and intent → merge. The two human touchpoints — approving the plan, reviewing the result — are where engineering judgment lives now.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Review the plan, not just the diff',
            text: "Five minutes on the agent's plan catches wrong directions before they become 400-line diffs. It's the cheapest quality gate in the whole loop.",
          },
        ],
      },
      {
        heading: "Context is what you're actually managing",
        blocks: [
          {
            kind: 'p',
            text: "An agent's output quality tracks the context it can reach: the relevant files, your conventions, the failing test output, runtime logs. Good setups make this ambient — a project instructions file (CLAUDE.md / AGENTS.md) carrying conventions and commands, codebase search the agent can use, and tests it can run. When an agent produces something misconceived, the first question is the same as for any LLM system: *what context was it missing?*",
          },
          {
            kind: 'list',
            items: [
              'Keep a project instructions file: build commands, style rules, architectural decisions, gotchas.',
              "Small, focused tasks beat 'build the feature' — decompose like you would for a new teammate.",
              'Feed errors back verbatim; agents fix concrete failures far better than vague complaints.',
            ],
          },
        ],
      },
      {
        heading: 'Tests change roles: from safety net to specification',
        blocks: [
          {
            kind: 'p',
            text: 'When a machine writes the code, tests become the enforceable part of the spec — the referee that lets the agent iterate until objectively correct, and your protection against confident-looking wrongness. Test-driven development gets a second life here: write (or approve) the tests first, then let the agent make them pass. Conversely: an agent asked to make tests pass may take shortcuts — review that the *tests* still test the right thing.',
          },
        ],
      },
      {
        heading: 'Where judgment still rules',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Architecture**: agents optimize locally; humans own system boundaries and long-term coherence.',
              '**Security-sensitive code**: auth, payments, crypto — agent code here gets adversarial review, no exceptions.',
              "**The codebase you don't read**: accepting code you don't understand is borrowing against a debt that comes due at the worst time.",
              "**Verification**: 'the agent said it works' is not verification. Run it, test it, read the diff.",
            ],
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'The role shift',
            text: 'The job moves up the stack: from writing code to specifying it, reviewing it, and verifying it. Engineers who write crisp specs and review rigorously get multiplied; engineers who rubber-stamp get slop at scale.',
          },
        ],
      },
    ],
    takeaways: [
      'Loop: spec → plan (approve it) → implement → tests referee → human review → merge.',
      'Agent quality tracks available context — instructions files, search, runnable tests.',
      'Tests become the enforceable spec; TDD pairs unusually well with coding agents.',
      "Architecture, security, and verification stay human; never merge what you didn't read.",
      'The skill that scales is writing specs and reviews, not keystrokes.',
    ],
    goDeeper: [
      {
        label: 'Claude Code — best practices',
        url: 'https://www.anthropic.com/engineering/claude-code-best-practices',
      },
    ],
  },
  {
    slug: 'ai-chat-assistant',
    title: 'Building an AI Chat Assistant',
    tagline: 'The capstone: every concept in this curriculum, assembled',
    intro:
      'A production chat assistant is the hello-world that never stops teaching: streaming, session memory, retrieval, tools, guardrails, and evals all meet in one system. This lesson walks the architecture end to end — and maps each piece back to the lesson that covers it.',
    module: 'practice',
    minutes: 9,
    sections: [
      {
        heading: 'The request path',
        blocks: [
          {
            kind: 'p',
            text: 'A message arrives at your API route (authenticated, rate-limited), which loads the **session history**, hands everything to the **orchestrator** to assemble the prompt — system instructions, compacted history, retrieved context, tool definitions — calls the model, and **streams** tokens back over SSE or WebSocket as they generate. The response is appended to the session, and any validators run before content reaches the user.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Streaming is non-negotiable',
            text: "Full responses take many seconds; time-to-first-token can be under one. Streaming is the difference between 'broken' and 'alive' — build it in from the first prototype, including through your tool-call turns.",
          },
        ],
      },
      {
        heading: 'Memory: sessions now, durable memory later',
        blocks: [
          {
            kind: 'p',
            text: 'Start simple: a sessions table keyed by conversation id, storing the message list; send recent history each call and **compact** older turns into a summary when the window strains (Agent Memory & State). Durable cross-session memory — user preferences, facts — is a v2 feature built as a store the assistant reads selectively, not a transcript dump. Resist making memory clever before retrieval and evals exist.',
          },
        ],
      },
      {
        heading: 'Making it useful: retrieval and tools',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Retrieval** (How RAG Works, Knowledge Q&A): embed the user's question, fetch relevant docs, inject as context with citation instructions. This is what makes the assistant *yours* rather than a thin model wrapper.",
              '**Tools** (Structured Outputs & Tool Calling): start read-only — order lookup, search, account status. Write actions (cancel, refund, book) come only with approval gates and audit logs (Guardrails).',
              "**Query rewriting**: conversational follow-ups ('what about the annual plan?') need rewriting into standalone queries before retrieval — the single most common chat-RAG bug.",
            ],
          },
        ],
      },
      {
        heading: 'Making it safe and shippable',
        blocks: [
          {
            kind: 'p',
            text: "Scope the assistant's topics in the system prompt, but enforce with guards: input classification, output moderation, grounding checks on cited answers, and a refusal path that hands off to a human gracefully. Then the production kit from this curriculum: traces on every request, an eval suite grown from real conversations, canary deploys for prompt changes, and cost monitoring per conversation (LLM Evals, Production Deployment, LLM System Design).",
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Ship order that works',
            text: '1) Streaming chat with sessions. 2) Retrieval with citations. 3) Evals + traces. 4) Read-only tools. 5) Guardrails hardened. 6) Write actions with approvals. Each stage is shippable; most products discover they need fewer stages than they feared.',
          },
        ],
      },
      {
        heading: 'Where to go from here',
        blocks: [
          {
            kind: 'p',
            text: "Build it. Pick a corpus you know — your team's docs, your notes — and take it through the ship order above. Every lesson in this curriculum becomes concrete the first time your own assistant hallucinates (evals), forgets (memory), retrieves the wrong doc (chunking), or does something alarming (guardrails). That debugging is the real course.",
          },
        ],
      },
    ],
    takeaways: [
      'Architecture: API route → session load → orchestrator → model → streamed response, validators on the way out.',
      'Sessions + compaction first; durable memory is a v2 feature.',
      'Retrieval with citations and query rewriting make the assistant genuinely yours.',
      'Tools go read-only first; write actions need approval gates and audit logs.',
      'Ship in stages, instrument everything, and let real conversations grow the eval suite.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — streaming API',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/streaming',
      },
      { label: 'Vercel AI SDK', url: 'https://sdk.vercel.ai' },
    ],
  },
]
