import type { Lesson } from '../types'

export const production: Lesson[] = [
  {
    slug: 'llm-evals',
    title: 'LLM Evals',
    tagline: 'Unit tests for model behaviour — the difference between guessing and engineering',
    intro:
      "You cannot improve what you cannot measure, and with LLMs you can't even safely *change* what you can't measure: any prompt tweak, model upgrade, or retrieval change can silently regress behaviour. Evals are the test suite that makes iteration safe.",
    module: 'production',
    minutes: 9,
    sections: [
      {
        heading: 'Why vibes fail',
        blocks: [
          {
            kind: 'p',
            text: "The universal anti-pattern: tweak the prompt, try two examples, looks better, ship. LLM outputs are high-variance — a change that improves the examples you looked at can degrade the ones you didn't. Teams without evals ricochet between regressions; teams with evals compound improvements. It is the single clearest predictor of whether an LLM product gets better over time.",
          },
        ],
      },
      {
        heading: 'The anatomy of an eval',
        blocks: [
          {
            kind: 'p',
            text: 'An eval is three parts: a **dataset** of representative cases (inputs, plus expected outputs or grading criteria), a **runner** that executes your actual system against them, and **graders** that score the results into metrics you track over time.',
          },
          {
            kind: 'list',
            items: [
              'Start with 20–50 cases from real usage; grow the set from production failures — every incident becomes a permanent regression test.',
              'Include hard cases and should-refuse cases, not just happy paths.',
              'Run against the real pipeline (prompt + retrieval + model + parsing), not the model in isolation.',
            ],
          },
        ],
      },
      {
        heading: 'Three kinds of graders',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Code graders** — exact match, regex, schema validation, 'does the code pass the tests'. Cheap, deterministic, incorruptible. Use whenever the task has checkable structure.",
              "**LLM-as-judge** — a model grades outputs against a written rubric ('is the answer supported by the context? 1–5'). Scales subjective judgment; validate the judge itself against a sample of human labels before trusting it.",
              '**Human review** — the ground truth that calibrates everything else. Too expensive to run always; essential to run periodically.',
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Judge-craft in one paragraph',
            text: 'Give the judge a rubric with concrete criteria, ask for reasoning before the score, use a small scale (1–5, or better: pass/fail per criterion), and spot-check its agreement with humans quarterly. A drifting judge is worse than no judge — it launders bad changes into green dashboards.',
          },
        ],
      },
      {
        heading: 'What to measure',
        blocks: [
          {
            kind: 'p',
            text: 'Metrics follow the failure modes you fear: **correctness** (is it right?), **faithfulness** (for RAG — is every claim supported by the retrieved context?), **format compliance** (does it parse?), **refusal correctness** (does it decline what it should, and only that?), plus **cost and latency**, which are quality attributes users feel. For agents, add task completion rate and steps-to-completion.',
          },
        ],
      },
      {
        heading: 'Wire evals into the lifecycle',
        blocks: [
          {
            kind: 'list',
            items: [
              'Run the eval suite on every prompt/model/pipeline change — in CI, like tests.',
              "Gate deploys on eval scores; block regressions the way you'd block failing tests.",
              'Sample production traffic and grade it continuously — offline evals miss distribution drift.',
              'Review failures weekly; move the biggest failure mode to the top of the backlog.',
            ],
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'The flywheel',
            text: "Production failures → new eval cases → fixes verified against them → fewer failures. That loop, run for months, is what 'our AI got really good' actually looks like from the inside.",
          },
        ],
      },
    ],
    takeaways: [
      'Evals = dataset + runner + graders; they make changing anything safe.',
      'Prefer code graders where possible; validate LLM judges against humans before trusting them.',
      'Measure what you fear: correctness, faithfulness, format, refusals, cost, latency.',
      "Every production failure becomes a permanent eval case — that flywheel is the product's moat.",
      'Gate releases on evals in CI, and keep grading sampled production traffic after launch.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — defining success & evals',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/define-success',
      },
      {
        label: 'Hamel Husain — Your AI product needs evals',
        url: 'https://hamel.dev/blog/posts/evals/',
      },
    ],
  },
  {
    slug: 'guardrails-and-safety',
    title: 'Guardrails & Safety',
    tagline: 'Defence in depth for systems that talk to strangers and touch production',
    intro:
      'An LLM system faces two directions of risk: what users can do to it (injection, extraction, abuse) and what it can do to users and your business (harmful output, leaked data, runaway actions). Guardrails are the layered checks that keep both within bounds.',
    module: 'production',
    minutes: 8,
    sections: [
      {
        heading: 'Threat model first',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Prompt injection** — adversarial instructions in user input *or in retrieved/fetched content* that hijack the model's behaviour. The defining LLM vulnerability.",
              "**Data leakage** — the model revealing system prompts, other users' data, or secrets it can reach through tools.",
              '**Harmful or off-brand output** — toxicity, dangerous instructions, confident misinformation under your logo.',
              '**Excessive agency** — an agent with write access doing something irreversible, expensive, or embarrassing at machine speed.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'Injection has no complete fix',
            text: 'Because instructions and data share one channel (tokens), prompt injection can be mitigated, not eliminated. Design as if some injection will eventually succeed: the question is what blast radius it finds when it does.',
          },
        ],
      },
      {
        heading: 'Input guards',
        blocks: [
          {
            kind: 'p',
            text: "Before the model sees anything: enforce topic scope (a refund bot doesn't discuss elections), detect known injection patterns, scrub or flag PII, and rate-limit per user. Input guards are cheap and fast — small classifiers and rules — so run them on everything. They won't catch clever attacks; they cut the noise so deeper layers face less volume.",
          },
        ],
      },
      {
        heading: 'Output guards',
        blocks: [
          {
            kind: 'p',
            text: 'After generation, before the user or downstream systems: schema validation (malformed output is a reliability guardrail too), moderation classifiers for harmful content, grounding checks for RAG (are claims supported by the retrieved context?), and secret/PII scanners. Output guards are your last line — and the only layer that sees what the model *actually said* rather than what you hoped it would.',
          },
        ],
      },
      {
        heading: 'Action guards — where agents raise the stakes',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Least-privilege tools**: read-only by default; write access scoped per tool and environment.',
              '**Approval gates**: irreversible or high-value actions (delete, pay, send, deploy) require human confirmation.',
              '**Budgets**: hard caps on steps, spend, and time enforced by the runtime — the model cannot talk its way past them.',
              '**Sandboxing**: code execution and file access in isolated environments with no lateral reach.',
            ],
          },
          {
            kind: 'p',
            text: "The principle across all three layers: **the model is not the enforcement point.** Prompts saying 'never do X' are guidance, not guarantees. Enforcement lives in code — validators, permissions, budgets — which cannot be persuaded.",
          },
        ],
      },
      {
        heading: 'Operate the guardrails',
        blocks: [
          {
            kind: 'p',
            text: 'Guardrails need the same lifecycle as any control: log every trigger (blocked inputs, failed validations, gated actions), review false positives — overzealous guards teach users to work around you — and red-team periodically with fresh injection techniques. Add refusal-correctness cases to your evals so safety and helpfulness are measured together; a system that refuses everything is safe and useless.',
          },
        ],
      },
    ],
    takeaways: [
      'Layer defences: input guards, output guards, action guards — no single check is reliable.',
      'Assume injection eventually succeeds; design for small blast radius via least privilege.',
      'Enforcement lives in code (validators, permissions, budgets), never in the prompt alone.',
      'Irreversible actions get human approval gates; everything gets logging.',
      'Measure refusal correctness alongside helpfulness — over-blocking is also a failure.',
    ],
    goDeeper: [
      {
        label: 'OWASP Top 10 for LLM applications',
        url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      },
      {
        label: 'Anthropic — strengthening safeguards',
        url: 'https://www.anthropic.com/news/testing-and-mitigating-elections-related-risks',
      },
    ],
  },
  {
    slug: 'llm-system-design',
    title: 'LLM System Design',
    tagline: 'The architecture around the model is what users actually experience',
    intro:
      'Model choice gets the headlines, but latency, cost, reliability, and quality are mostly determined by the system wrapped around the model: gateways, caches, routers, retrieval, and observability. This is classic systems design with new components — and new failure modes.',
    module: 'production',
    minutes: 9,
    sections: [
      {
        heading: 'The reference architecture',
        blocks: [
          {
            kind: 'p',
            text: 'Most production LLM systems converge on the shape in the diagram: clients hit an **API gateway** (auth, rate limits), which calls an **orchestrator** owning prompts, retrieval, and agent logic, which calls a **model gateway** that abstracts providers. Around this spine sit a **semantic cache**, the **vector store**, and an **observability plane** that sees everything. Each box earns its place by solving a specific production problem.',
          },
        ],
      },
      {
        heading: 'The model gateway: routing, fallbacks, and escape hatches',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Provider abstraction**: one internal interface over Claude/GPT/self-hosted, so swapping models is a config change with an eval run — not a rewrite.',
              '**Fallbacks**: providers have outages and rate limits; automatic failover to a second model keeps you up (test that your prompts work on the fallback *before* the outage).',
              "**Routing by difficulty**: send easy, high-volume calls to a fast cheap model and hard ones to a frontier model. Often the biggest single cost lever — routine classification doesn't need your most expensive model.",
              '**Central accounting**: per-request token and cost tracking lives naturally here.',
            ],
          },
        ],
      },
      {
        heading: 'Latency and cost engineering',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Streaming** everywhere users wait: time-to-first-token is the latency users feel.',
              '**Prompt caching**: providers discount reused prompt prefixes heavily — structure prompts so the stable parts (system prompt, tool defs, documents) come first.',
              '**Semantic caching**: serve repeated/near-duplicate questions from cache; mind staleness and per-user data in the key.',
              '**Token discipline**: trim prompts, cap output length, and paginate tool results — cost scales with tokens, and so does latency.',
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Know your unit economics',
            text: "Track cost per request and per user from day one. LLM features have COGS that scale with usage in a way traditional software doesn't — margins are an architecture property.",
          },
        ],
      },
      {
        heading: 'Reliability with a nondeterministic dependency',
        blocks: [
          {
            kind: 'p',
            text: 'LLM calls fail in novel ways: rate limits, timeouts on long generations, malformed outputs, and *quality* failures where the call succeeds but the answer is bad. Standard distributed-systems hygiene applies — retries with backoff, timeouts, circuit breakers, request hedging for tail latency — plus one new layer: output validation as a first-class failure branch, with a retry-with-feedback path before falling back to a degraded experience.',
          },
        ],
      },
      {
        heading: 'Observability is not optional',
        blocks: [
          {
            kind: 'p',
            text: 'Every request should leave a trace: full assembled prompt, retrieved chunks, model + parameters, raw output, validation results, tokens, cost, latency — and for agents, every step. This is simultaneously your debugging tool, your eval-case mine, your cost dashboard, and your audit log. Teams that skip it fly blind exactly when the system does something inexplicable.',
          },
        ],
      },
    ],
    takeaways: [
      'The system around the model determines latency, cost, and reliability — architecture is the product.',
      'A model gateway makes providers swappable and enables routing, fallbacks, and central cost accounting.',
      'Streaming, prompt caching, and difficulty-based routing are the big latency/cost levers.',
      'Treat bad outputs as a failure branch with retries and degradation paths, like any dependency failure.',
      'Full-fidelity tracing of every request is debugging, evals, and cost control in one investment.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — prompt caching',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
      },
      {
        label: 'Chip Huyen — AI Engineering (book)',
        url: 'https://www.oreilly.com/library/view/ai-engineering/9781098166298/',
      },
    ],
  },
  {
    slug: 'production-deployment',
    title: 'Production Deployment',
    tagline: 'Shipping and operating AI systems like the software they are',
    intro:
      'An AI feature that works in a notebook is perhaps a third of the way to production. The rest is ordinary shipping discipline — CI/CD, staged rollout, monitoring, rollback — with one twist: quality is probabilistic, so your pipeline gates on evals and your monitoring watches for drift.',
    module: 'production',
    minutes: 8,
    sections: [
      {
        heading: 'Everything is versioned together',
        blocks: [
          {
            kind: 'p',
            text: "An LLM system's behaviour is determined by code *and* prompts *and* model version *and* retrieval index *and* tool definitions. Version them as one deployable unit. The nightmare debugging session is 'the prompt changed in a dashboard on Tuesday, the model auto-upgraded Thursday, and nobody can reproduce last week's behaviour' — pin model versions and keep prompts in the repo.",
          },
        ],
      },
      {
        heading: 'CI with an eval gate',
        blocks: [
          {
            kind: 'p',
            text: "The pipeline looks familiar — lint, unit tests, build a container (the FastAPI + Docker of the classic stack) — with one added stage: **run the eval suite and fail the build on regression**, exactly as you'd fail on a broken test. This is the enforcement mechanism that makes everything in the evals lesson real; an eval suite that doesn't gate anything is a dashboard nobody checks.",
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Model upgrades are deploys',
            text: "A new model version — even a 'minor' one — goes through the same pipeline: eval gate, canary, monitoring. Never let a provider's default upgrade reach production untested.",
          },
        ],
      },
      {
        heading: 'Roll out gradually, roll back fast',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Canary**: route 5% of traffic to the new version; compare quality metrics, cost, and latency against the old one before widening.',
              '**A/B on quality**: for prompt or model changes, run both arms and compare eval scores on live traffic — offline evals miss real distribution.',
              '**Rollback**: keep the previous version warm and make reverting one command. With probabilistic quality, you will roll back more often than with normal software; make it boring.',
            ],
          },
        ],
      },
      {
        heading: 'Monitor the four surfaces',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Systems**: availability, latency (p50/p99, time-to-first-token), provider error rates.',
              '**Cost**: tokens per request, cost per user, anomaly alerts — a prompt bug can triple spend overnight without breaking anything visible.',
              '**Quality**: continuously grade a sample of production outputs (LLM judge + periodic human review); watch refusal and validation-failure rates.',
              "**Drift**: the input distribution shifts as users find new uses; yesterday's eval set slowly stops representing today's traffic. Feed fresh production cases back into the suite.",
            ],
          },
          {
            kind: 'p',
            text: 'The closing loop is the same flywheel from the evals lesson, now running in production: real traces become eval cases, eval cases gate the next release, and the system ratchets upward instead of oscillating.',
          },
        ],
      },
    ],
    takeaways: [
      'Version code, prompts, model, index, and tools as one unit; pin model versions.',
      'CI gates on evals; model upgrades go through the same pipeline as code.',
      'Canary + fast rollback make probabilistic quality operable.',
      'Monitor systems, cost, quality, and drift — cost bugs and quality drift are silent.',
      'Production traces feeding the eval suite is the loop that makes the system improve.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — guide to production',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/overview',
      },
    ],
  },
  {
    slug: 'fine-tuning-and-rlhf',
    title: 'Fine-Tuning & RLHF',
    tagline: 'How models learn behaviour — and when training your own is worth it',
    intro:
      "Between a raw next-token predictor and a helpful assistant lies a training pipeline: supervised fine-tuning, then alignment from human preferences. Understanding it explains why models behave as they do — and gives you an honest framework for the perennial question, 'should we fine-tune?'",
    module: 'production',
    minutes: 9,
    sections: [
      {
        heading: 'Base models: brilliant and useless',
        blocks: [
          {
            kind: 'p',
            text: 'Pretraining on internet-scale text produces a **base model** — a machine that continues text. Ask it a question and it may reply with three more questions, because question lists are common online. All the knowledge is in there; the *behaviour* of being an assistant is not. Everything after pretraining is about shaping behaviour.',
          },
        ],
      },
      {
        heading: 'SFT: teach the format by example',
        blocks: [
          {
            kind: 'p',
            text: "**Supervised fine-tuning** continues training on curated (prompt → good response) pairs. The model learns to *be an assistant*: answer the question, follow instructions, use the chat format. SFT is powerful and data-efficient — thousands of high-quality examples move behaviour substantially — but it only teaches imitation of what's in the demonstrations.",
          },
        ],
      },
      {
        heading: 'RLHF: optimize for preference, not imitation',
        blocks: [
          {
            kind: 'p',
            text: "Demonstrations can't cover 'which of these two decent answers is better' — so alignment moves to preferences. Humans rank pairs of model outputs; a **reward model** is trained to predict those rankings; then reinforcement learning (classically PPO) tunes the model to produce outputs the reward model scores highly. **DPO** achieves similar ends more simply by optimizing on preference pairs directly, skipping the separate reward model. This stage is why assistants feel helpful, hedged, and polite — they were optimized to be preferred.",
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Side effects you observe daily',
            text: "Preference optimization explains model quirks: agreeable-to-a-fault behaviour (sycophancy), verbose hedging, and reluctance at edgy-but-legitimate requests. These aren't bugs in your prompt — they're the shape of the reward.",
          },
        ],
      },
      {
        heading: 'Should *you* fine-tune?',
        blocks: [
          {
            kind: 'p',
            text: 'With APIs for fine-tuning small and mid-size models, the question is live for product teams. The honest decision framework:',
          },
          {
            kind: 'list',
            items: [
              "**Good reasons**: a persistent style/format/domain-dialect gap that prompting can't close; distilling a frontier model's behaviour into a small cheap model for a narrow high-volume task; strict latency budgets where shorter prompts matter.",
              "**Bad reasons**: injecting fresh or proprietary knowledge (that's RAG — fine-tuned facts go stale and can't be cited); fixing problems you haven't measured; skipping prompt engineering because it feels less serious than training.",
              "**Prerequisites**: an eval suite (or you can't tell if it worked), hundreds-to-thousands of quality examples, and a plan for re-tuning when the base model updates.",
            ],
          },
          {
            kind: 'p',
            text: "The industry default holds: prompt first, retrieve second, fine-tune third — not because fine-tuning is weak, but because the first two are cheaper, faster to iterate, and cover most gaps. When fine-tuning does win, it's usually **LoRA-style parameter-efficient tuning** on a small model, judged by the same evals as everything else.",
          },
        ],
      },
    ],
    takeaways: [
      'Pipeline: pretraining → SFT (imitate demonstrations) → RLHF/DPO (optimize for preference).',
      'Assistant behaviour — helpfulness, hedging, sycophancy — is the shape of the reward, not accident.',
      'Fine-tune for style, format, and distillation; use RAG for knowledge.',
      "No eval suite, no fine-tuning — you couldn't tell whether it helped.",
      'Default order: prompt → retrieve → fine-tune, escalating only on measured gaps.',
    ],
    goDeeper: [
      { label: 'InstructGPT paper (RLHF)', url: 'https://arxiv.org/abs/2203.02155' },
      { label: 'DPO paper', url: 'https://arxiv.org/abs/2305.18290' },
    ],
  },
]
