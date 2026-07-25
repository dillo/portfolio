import type { Lesson } from '../types'

export const foundations: Lesson[] = [
  {
    slug: 'llm-concepts',
    title: 'LLM Concepts',
    tagline: 'Tokens, context windows, and why LLMs behave the way they do',
    intro:
      "Everything an AI engineer builds sits on top of one deceptively simple machine: a model that predicts the next token. Understand tokens, the context window, and sampling, and most 'weird' LLM behaviour stops being weird.",
    module: 'foundations',
    minutes: 9,
    sections: [
      {
        heading: 'The next-token loop',
        blocks: [
          {
            kind: 'p',
            text: 'A large language model does one thing: given a sequence of tokens, it outputs a probability distribution over what token comes next. Generation is that step in a loop — sample a token, append it to the sequence, predict again — until a stop condition. Chatbots, agents, and code assistants are all this loop wearing different clothes.',
          },
          {
            kind: 'p',
            text: "This explains properties that surprise newcomers. The model has no working memory outside the token sequence. It cannot 'go back and fix' something it already emitted. And it never chooses words — it samples them from a distribution, which is why the same prompt can produce different answers.",
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Mental model',
            text: 'An LLM is a stateless function: `(all tokens so far) → (probabilities for the next token)`. All statefulness in your product — chat history, memory, tools — is engineering you build around that function.',
          },
        ],
      },
      {
        heading: 'Tokens, not words',
        blocks: [
          {
            kind: 'p',
            text: 'Models read and write **tokens** — subword chunks produced by a tokenizer. In English, a token averages about four characters, so 1,000 tokens is roughly 750 words. Code, other languages, and unusual strings tokenize less efficiently.',
          },
          {
            kind: 'list',
            items: [
              '**Cost and latency scale with tokens**, not requests. Verbose prompts and outputs cost real money at volume.',
              'Character-level tasks (counting letters, reversing strings) are hard for models because they never see characters — only tokens.',
              "Every model has a tokenizer; the same text has different token counts on different models. Measure, don't guess.",
            ],
          },
        ],
      },
      {
        heading: 'The context window is the whole world',
        blocks: [
          {
            kind: 'p',
            text: 'The **context window** is the maximum number of tokens the model can attend to in one call — system prompt, conversation history, retrieved documents, tool results, and the answer it is generating, all sharing one budget. Nothing outside the window exists for the model.',
          },
          {
            kind: 'p',
            text: 'Modern windows are large (hundreds of thousands of tokens) but not free: cost grows with input size, and models attend less reliably to information buried in the middle of an enormous context. Deciding *what deserves those tokens* is such a central skill that it has its own discipline — context engineering, covered later in this curriculum.',
          },
        ],
      },
      {
        heading: 'Sampling: temperature and friends',
        blocks: [
          {
            kind: 'p',
            text: 'The distribution over next tokens is shaped by sampling parameters. **Temperature** rescales the distribution: near 0 the model almost always picks the top token (good for extraction, classification, code); higher values spread probability across more candidates (good for brainstorming and variety). **Top-p** restricts sampling to the smallest set of tokens whose probabilities sum to p.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Practical default',
            text: "Change one knob at a time. For deterministic-ish pipelines, set low temperature and leave top-p alone. Note that temperature 0 still doesn't guarantee identical outputs across runs on most providers.",
          },
        ],
      },
      {
        heading: 'Hallucination is a feature you must engineer around',
        blocks: [
          {
            kind: 'p',
            text: 'The model is trained to produce *plausible* continuations, not *true* ones. When it lacks knowledge, the most plausible continuation is often a confident-sounding fabrication. This is not a bug to wait out — it is the default behaviour of the machinery.',
          },
          {
            kind: 'list',
            items: [
              'Ground answers in retrieved documents (RAG) so the model quotes instead of recalls.',
              'Give the model explicit permission to say "I don\'t know".',
              'Validate outputs downstream — schemas, citations checks, evals — instead of trusting them.',
            ],
          },
        ],
      },
    ],
    takeaways: [
      'An LLM is a stateless next-token predictor; every product feature is engineering around that loop.',
      'Tokens are the unit of cost, latency, and capacity — think in tokens, not words.',
      "The context window is the model's entire world; managing it is a core engineering skill.",
      'Temperature and top-p shape randomness; low for precision, higher for variety.',
      'Hallucination is default behaviour — ground, permit uncertainty, and validate.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — Models overview',
        url: 'https://docs.anthropic.com/en/docs/about-claude/models',
      },
      { label: 'OpenAI tokenizer playground', url: 'https://platform.openai.com/tokenizer' },
      {
        label: 'Karpathy — Intro to LLMs (video)',
        url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
      },
    ],
  },
  {
    slug: 'prompt-engineering',
    title: 'Prompt Engineering',
    tagline: 'Treat prompts as versioned, tested engineering artifacts',
    intro:
      'Prompting is the highest-leverage, lowest-cost way to change model behaviour — and the most commonly botched. The craft is not magic words; it is clear specification, good structure, and an eval loop that tells you whether a change helped.',
    module: 'foundations',
    minutes: 8,
    sections: [
      {
        heading: 'The anatomy of a strong prompt',
        blocks: [
          {
            kind: 'p',
            text: 'Production prompts converge on the same skeleton: a **system role** that sets identity and hard rules, **instructions** that state the task precisely, **examples** that show the pattern, **context** carrying the data the task needs, and an explicit **output format**. The diagram above shows the pieces; most prompt bugs are one of them missing.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'The intern test',
            text: 'Read your prompt as if it were a ticket handed to a smart intern with no context on your project. If they would have to guess anything — audience, format, edge cases, what to do when data is missing — the model is guessing too.',
          },
        ],
      },
      {
        heading: 'The techniques that matter',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Zero-shot**: just instructions. Start here; modern models are good at it.',
              '**Few-shot**: 2–5 input→output examples. The single most reliable way to pin down format and style — models imitate patterns better than they follow descriptions.',
              '**Chain-of-thought**: ask the model to reason step-by-step before answering. Helps on math, logic, and multi-constraint tasks; wasteful for simple extraction. Reasoning models do this internally.',
              '**Decomposition**: split one mega-prompt into a pipeline of focused calls. Each step becomes testable and debuggable.',
            ],
          },
          {
            kind: 'p',
            text: 'Structure beats cleverness. Delimit inputs clearly (XML tags or fenced blocks), put instructions before long documents, and never mix data with instructions — that ambiguity is also how prompt injection sneaks in.',
          },
        ],
      },
      {
        heading: 'Iterate like an engineer, not a gambler',
        blocks: [
          {
            kind: 'p',
            text: 'The failure mode is tweaking adjectives and eyeballing one output. The professional loop: build a small eval set of representative inputs (start with 20), score outputs against it, change **one thing**, re-run, keep what wins. Prompts belong in version control with a changelog, because a prompt edit can regress behaviour as surely as a code edit.',
          },
          {
            kind: 'code',
            lang: 'text',
            code: 'You are a support-ticket triage assistant for Acme\'s engineering team.\n\nClassify the ticket into exactly one category: BUG, FEATURE_REQUEST, QUESTION, or OUTAGE.\n\nRules:\n- OUTAGE only if users are currently blocked.\n- If ambiguous, prefer QUESTION and explain why in one sentence.\n\n<ticket>\n{{ticket_text}}\n</ticket>\n\nRespond as JSON: {"category": "...", "reason": "..."}',
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'Prompts are model-specific',
            text: 'A prompt tuned on one model may behave differently on another — including newer versions of the same family. Re-run your evals whenever you swap or upgrade models.',
          },
        ],
      },
      {
        heading: "When prompting isn't enough",
        blocks: [
          {
            kind: 'p',
            text: 'Prompting sets behaviour; it cannot inject knowledge the model lacks (use retrieval), guarantee structure (use structured outputs), or enforce safety (use guardrails). Knowing which lever to reach for is much of the job — exhaust prompting first because it is the cheapest, but recognise its ceiling.',
          },
        ],
      },
    ],
    takeaways: [
      'A strong prompt has five parts: role, instructions, examples, context, output format.',
      'Few-shot examples are the most reliable way to control format and style.',
      'Change one variable at a time and measure against an eval set — never eyeball a single output.',
      'Version prompts like code; re-test when the model changes.',
      "Prompting can't add knowledge or guarantee structure — know when to reach for RAG, schemas, or guardrails.",
    ],
    goDeeper: [
      {
        label: 'Anthropic prompt engineering guide',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
      },
      {
        label: 'OpenAI prompting guide',
        url: 'https://platform.openai.com/docs/guides/prompt-engineering',
      },
    ],
  },
  {
    slug: 'structured-outputs-tool-calling',
    title: 'Structured Outputs & Tool Calling',
    tagline: 'Turning free text into typed data and real actions',
    intro:
      "Software needs types, and LLMs emit prose. Structured outputs make model responses machine-readable; tool calling lets the model invoke your functions. Together they are the bridge between 'chatbot' and 'system component' — and the foundation agents are built on.",
    module: 'foundations',
    minutes: 8,
    sections: [
      {
        heading: "Why 'just ask for JSON' fails",
        blocks: [
          {
            kind: 'p',
            text: "Prompted politely, a model will usually return JSON — and occasionally wrap it in markdown fences, add a chatty preamble, invent a field, or emit a trailing comma. 'Usually' is fatal in a pipeline that parses the result. Structure must be enforced, not requested.",
          },
          {
            kind: 'list',
            items: [
              '**Schema-enforced generation** (JSON mode / structured outputs): the provider constrains decoding so output is guaranteed to match your JSON Schema. Use this when available.',
              '**Validate-and-retry**: parse with Pydantic or Zod; on failure, send the error back and ask the model to fix it. One retry resolves the vast majority of failures.',
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Design schemas for models',
            text: 'Flat, well-named fields with descriptions beat deeply nested cleverness. An `enum` beats a free-text string. Add a `reasoning` field first if you want the model to think before it fills in the answer fields — order matters, since output is generated left to right.',
          },
        ],
      },
      {
        heading: 'Tool calling: the model decides, your code executes',
        blocks: [
          {
            kind: 'p',
            text: 'With tool calling (also called function calling), you pass the model a list of function signatures — name, description, JSON-Schema parameters. When the model decides a tool would help, it responds not with prose but with a structured call like `get_weather({"city": "Osaka"})`. **Your code** runs the function and returns the result to the model, which continues with real data.',
          },
          {
            kind: 'p',
            text: 'That division of labour is the key safety property: the model only ever *proposes* actions as data. Your runtime decides whether to execute, with whatever authorization, sandboxing, and logging you build. The model has no hands; you are lending it yours.',
          },
          {
            kind: 'code',
            lang: 'python',
            code: 'tools = [{\n    "name": "get_order_status",\n    "description": "Look up the current status of a customer order.",\n    "input_schema": {\n        "type": "object",\n        "properties": {\n            "order_id": {"type": "string", "description": "e.g. ORD-12345"}\n        },\n        "required": ["order_id"],\n    },\n}]\n# loop: model returns tool_use → you execute → return tool_result → model answers',
          },
        ],
      },
      {
        heading: 'Writing tools the model can actually use',
        blocks: [
          {
            kind: 'list',
            items: [
              'Descriptions are prompts. Say what the tool does, when to use it, and when *not* to.',
              'Few, distinct tools beat many overlapping ones — ten similar tools invite wrong choices.',
              'Return errors as informative strings (`"order not found; ids look like ORD-12345"`) so the model can self-correct.',
              'Make tools idempotent where possible; models sometimes retry.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'Tool results are untrusted input',
            text: "A web page or document fetched by a tool can contain adversarial instructions ('ignore your previous instructions and…'). Treat tool output as data, never as commands — this is the prompt-injection surface of every agent.",
          },
        ],
      },
    ],
    takeaways: [
      'Never parse free-text model output in a pipeline — enforce schemas or validate-and-retry.',
      'Field order and names are part of the prompt; design schemas for the model, not just the database.',
      'In tool calling the model proposes, your code disposes — execution and authorization stay on your side.',
      'Tool descriptions are prompts; error messages are how tools teach the model to recover.',
      'Treat all tool results as untrusted input — prompt injection rides in on data.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — tool use docs',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
      },
      {
        label: 'OpenAI — structured outputs',
        url: 'https://platform.openai.com/docs/guides/structured-outputs',
      },
    ],
  },
  {
    slug: 'embeddings-101',
    title: 'Embeddings 101',
    tagline: 'Turning meaning into geometry',
    intro:
      'Embeddings convert text into vectors so that semantic similarity becomes measurable distance. They are the engine behind semantic search, RAG retrieval, deduplication, clustering, and recommendation — arguably the second most important model type an AI engineer uses.',
    module: 'foundations',
    minutes: 7,
    sections: [
      {
        heading: 'What an embedding is',
        blocks: [
          {
            kind: 'p',
            text: 'An embedding model maps a piece of text to a fixed-length vector — typically a few hundred to a few thousand floats — such that texts with similar meaning land near each other. "I love my cat" and "Kittens are adorable" share almost no words, yet their vectors sit close together; a sentence about quarterly revenue lands in a different neighbourhood entirely.',
          },
          {
            kind: 'p',
            text: "Similarity is computed with **cosine similarity** (or dot product on normalized vectors): 1.0 means identical direction, values near 0 mean unrelated. That single number is what powers 'find me the most relevant documents'.",
          },
        ],
      },
      {
        heading: 'Keyword search vs semantic search',
        blocks: [
          {
            kind: 'p',
            text: 'Keyword search (BM25) matches exact terms — precise for identifiers, error codes, and names, but blind to synonyms: a search for "laptop won\'t turn on" misses a doc titled "notebook fails to boot". Embedding search matches meaning but can be fuzzy about exact strings. Production systems usually run **hybrid search** — both at once, results merged — because the failure modes are complementary.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Rule of thumb',
            text: 'If your users search for error codes, SKUs, or function names, you need keyword search in the mix. If they search in natural language, you need embeddings. Most real systems need both.',
          },
        ],
      },
      {
        heading: 'Practical engineering decisions',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Model choice**: embedding models are small and cheap relative to LLMs. Check retrieval benchmarks (MTEB) but validate on *your* data.',
              '**Never mix models**: vectors from different embedding models live in incomparable spaces. Re-embed everything when you switch — plan for that migration.',
              "**What you embed matters**: embed chunks, not whole documents; consider prepending titles or headings so context isn't lost.",
              '**Dimensions trade off**: more dimensions capture more nuance but cost more storage and search time; many models offer truncatable dimensions.',
            ],
          },
        ],
      },
      {
        heading: 'Beyond search',
        blocks: [
          {
            kind: 'p',
            text: "Because embeddings turn meaning into coordinates, anything geometric becomes possible: **clustering** support tickets to discover themes, **deduplicating** near-identical content, **classifying** by nearest labeled example, and **recommending** items whose descriptions sit near a user's interests. When you have a fuzzy 'is this similar to that?' problem, reach for embeddings before reaching for an LLM call — they're orders of magnitude cheaper.",
          },
        ],
      },
    ],
    takeaways: [
      'Embeddings map text to vectors where distance ≈ semantic similarity.',
      'Cosine similarity between vectors is the primitive behind semantic search and RAG.',
      'Hybrid (keyword + vector) search beats either alone — the failure modes are complementary.',
      'Vectors from different models are incomparable; switching models means re-embedding everything.',
      'For similarity, clustering, and dedup problems, embeddings are far cheaper than LLM calls.',
    ],
    goDeeper: [
      {
        label: 'MTEB embedding leaderboard',
        url: 'https://huggingface.co/spaces/mteb/leaderboard',
      },
      {
        label: 'Anthropic — embeddings guide',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/embeddings',
      },
    ],
  },
]
