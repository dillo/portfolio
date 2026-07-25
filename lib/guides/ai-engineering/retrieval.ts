import type { Lesson } from '../types'

export const retrieval: Lesson[] = [
  {
    slug: 'how-rag-works',
    title: 'How RAG Works',
    tagline: 'Grounding the model in your data instead of its training set',
    intro:
      "Retrieval-augmented generation solves the two hardest problems of raw LLMs — stale knowledge and hallucination — by fetching relevant documents at query time and letting the model answer from them. It is the default architecture for any 'chat with our docs/data' product.",
    module: 'retrieval',
    minutes: 9,
    sections: [
      {
        heading: 'Why retrieval at all?',
        blocks: [
          {
            kind: 'p',
            text: "A model knows only what was in its training data — nothing after its cutoff, nothing private to your company, and nothing it can cite. Fine-tuning is a poor fix for knowledge: it's slow, expensive, and the model still can't tell you where a fact came from. RAG sidesteps all of this: keep knowledge in a searchable store, retrieve what's relevant to each question, and put it in the prompt.",
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'The one-line summary',
            text: 'RAG = search + prompt stuffing, done well. The model stops recalling and starts reading.',
          },
        ],
      },
      {
        heading: 'Phase 1 — Ingestion (offline)',
        blocks: [
          {
            kind: 'p',
            text: 'Before anyone asks a question, you build the index. Documents are loaded and cleaned, **chunked** into retrieval-sized pieces, run through an **embedding model**, and stored in a **vector database** alongside their text and metadata (source, title, date, permissions).',
          },
          {
            kind: 'list',
            items: [
              'Quality in, quality out: broken PDF extraction or HTML boilerplate poisons every downstream answer.',
              'Chunking is a real design decision — enough that it gets its own lesson in this track.',
              "Store metadata you'll want to filter on later (team, product, date, access level). Retrofitting it is painful.",
            ],
          },
        ],
      },
      {
        heading: 'Phase 2 — Query time (online)',
        blocks: [
          {
            kind: 'p',
            text: 'When a question arrives: embed it with the same model, search the vector store for the **top-k** most similar chunks, assemble a prompt containing the question plus those chunks, and instruct the model to answer *only from the provided context* — citing which chunks support each claim.',
          },
          {
            kind: 'code',
            lang: 'text',
            code: 'Answer the question using ONLY the context below.\nCite sources as [1], [2]. If the context is insufficient, say so.\n\n<context>\n[1] (billing-faq.md) Refunds are processed within 5 business days…\n[2] (terms.md) Annual plans may be cancelled within 30 days…\n</context>\n\nQuestion: {{question}}',
          },
          {
            kind: 'p',
            text: "The instruction to admit insufficiency matters as much as the retrieval: it converts 'no good documents found' from a hallucination into an honest answer.",
          },
        ],
      },
      {
        heading: 'Where RAG actually fails',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Retrieval misses** — the answer exists but wasn't in the top-k. Causes: bad chunking, vocabulary mismatch, missing hybrid search. This is the #1 failure mode; fix retrieval before touching the prompt.",
              '**Context ignored** — the model answers from its own priors despite the documents. Stronger instructions and citation requirements help.',
              "**Stale index** — documents changed but embeddings didn't. You need an update pipeline, not a one-off script.",
              "**Permission leaks** — retrieval that ignores access control shows user A the contents of user B's documents. Filter at query time.",
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Evaluate the stages separately',
            text: "Measure retrieval (did the right chunks come back? — recall@k) and generation (was the answer faithful to them?) independently. A wrong answer with correct retrieval is a prompting problem; with wrong retrieval it's a search problem. The fixes are completely different.",
          },
        ],
      },
      {
        heading: 'RAG in the age of huge context windows',
        blocks: [
          {
            kind: 'p',
            text: "Million-token windows don't kill RAG — corpora are bigger than any window, per-token cost punishes brute force, and answer quality degrades when relevant facts swim in noise. What changes is the *unit* of retrieval: you can afford to retrieve whole documents instead of fragments, and use agentic retrieval where the model searches iteratively. Retrieval remains; only the granularity relaxes.",
          },
        ],
      },
    ],
    takeaways: [
      'RAG grounds generation in retrieved documents — fixing staleness, privacy, and citability in one move.',
      'Two pipelines: offline ingestion (chunk → embed → index) and online query (embed → search → prompt → answer).',
      'Instruct the model to answer only from context and to admit when context is insufficient.',
      'Most RAG failures are retrieval failures — measure recall before rewriting prompts.',
      'Big context windows change retrieval granularity, not the need for retrieval.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — RAG guidance',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/search-results',
      },
      { label: 'Original RAG paper (Lewis et al.)', url: 'https://arxiv.org/abs/2005.11401' },
    ],
  },
  {
    slug: 'vector-database-101',
    title: 'Vector Database 101',
    tagline: 'How similarity search stays fast at millions of vectors',
    intro:
      "A vector database stores embeddings and answers one question extremely fast: 'which stored vectors are closest to this one?' Understanding how — and what the knobs cost you — separates engineers who operate RAG systems from those who just call them.",
    module: 'retrieval',
    minutes: 8,
    sections: [
      {
        heading: "The problem: exact search doesn't scale",
        blocks: [
          {
            kind: 'p',
            text: 'Finding the true nearest neighbours of a query vector means comparing it against every stored vector — linear in collection size. Fine at 10,000 vectors, painful at 10 million, impossible at billions under real latency budgets. Vector databases solve this with **approximate nearest neighbour (ANN)** indexes: give up a sliver of recall, gain orders of magnitude in speed.',
          },
        ],
      },
      {
        heading: 'How ANN indexes work',
        blocks: [
          {
            kind: 'p',
            text: 'The dominant index is **HNSW** (Hierarchical Navigable Small World): vectors become nodes in a layered graph where each node links to its near neighbours. A search enters at a sparse top layer, greedily walks toward the query, and descends to denser layers — like zooming from a country map to a street map. Queries touch a tiny fraction of the data.',
          },
          {
            kind: 'list',
            items: [
              '**IVF** partitions vectors into clusters and searches only the closest few — cheaper to build, coarser recall.',
              '**Quantization** compresses vectors (e.g. float32 → int8) to shrink memory at slight accuracy cost; often layered on other indexes.',
              "Index parameters (like HNSW's `ef_search`) trade recall against latency at query time — a dial you can turn per workload.",
            ],
          },
        ],
      },
      {
        heading: 'Metadata filtering — the underrated feature',
        blocks: [
          {
            kind: 'p',
            text: "Real queries are rarely 'nearest anything': they're nearest *within the user's documents*, *from the last quarter*, *in the product docs*. Vector databases attach metadata to each vector and filter during search. This is also where **multi-tenancy and permissions** live — filtering by tenant at query time is a correctness and security requirement, not an optimisation.",
          },
          {
            kind: 'callout',
            tone: 'warn',
            title: 'Filters change recall',
            text: 'Heavy filtering shrinks the searchable set and can starve an ANN index, returning fewer or worse results than expected. Test retrieval quality with production-shaped filters, not on the raw collection.',
          },
        ],
      },
      {
        heading: 'Choosing one',
        blocks: [
          {
            kind: 'p',
            text: "The honest answer: at small scale they're all fine, and the best choice is usually **the database you already run** — pgvector inside Postgres covers an enormous number of real products with zero new infrastructure. Dedicated engines (Qdrant, Weaviate, Milvus, Pinecone, Turbopuffer) earn their place at large scale, high QPS, or when you need their specific features (serverless pricing, hybrid search built-in, multi-tenant isolation).",
          },
          {
            kind: 'list',
            items: [
              'Prototype: pgvector or an in-process library (FAISS, LanceDB).',
              "Growing product: pgvector until it hurts; you'll know.",
              "Scale / dedicated needs: benchmark 2–3 engines on *your* vectors, filters, and QPS — vendor benchmarks won't transfer.",
            ],
          },
        ],
      },
    ],
    takeaways: [
      'Vector DBs make similarity search fast via ANN indexes — approximate by design, tunably so.',
      "HNSW's layered graph is the workhorse: enter sparse, walk greedy, descend to dense.",
      'Metadata filtering is where real queries, permissions, and multi-tenancy live — test recall with filters on.',
      'Start with pgvector or an embedded library; adopt a dedicated engine when scale demands it.',
      'Benchmark on your own data — recall/latency trade-offs are workload-specific.',
    ],
    goDeeper: [
      { label: 'HNSW paper', url: 'https://arxiv.org/abs/1603.09320' },
      { label: 'pgvector', url: 'https://github.com/pgvector/pgvector' },
    ],
  },
  {
    slug: 'chunking-strategies',
    title: 'Chunking Strategies',
    tagline: 'The unglamorous decision that makes or breaks retrieval',
    intro:
      'Before anything is embedded, documents must be split into chunks — and that split quietly determines what your system can ever retrieve. Chunk badly and no amount of prompt engineering downstream will save you.',
    module: 'retrieval',
    minutes: 7,
    sections: [
      {
        heading: 'Why chunk size is a real trade-off',
        blocks: [
          {
            kind: 'p',
            text: "A chunk is the unit of retrieval: its embedding is what gets matched, its text is what enters the prompt. **Small chunks** produce sharp embeddings that match queries precisely but may arrive stripped of context ('it increased by 40%' — what did?). **Large chunks** carry context but their embeddings blur several topics together, matching everything weakly. There is no universally right size — only a right size for your documents and queries.",
          },
          {
            kind: 'callout',
            tone: 'note',
            title: 'Starting point',
            text: 'A few hundred tokens per chunk with 10–15% overlap is a sane default for prose. Treat it as the beginning of tuning, not the end.',
          },
        ],
      },
      {
        heading: 'The main strategies',
        blocks: [
          {
            kind: 'list',
            items: [
              "**Fixed-size + overlap** — split every N tokens, overlapping neighbours so sentences aren't cut dead at boundaries. Dumb, predictable, surprisingly strong baseline.",
              "**Structural / semantic** — split on the document's own seams: headings, paragraphs, sections. Chunks align with units of meaning, so embeddings are cleaner. Requires parsing structure (Markdown/HTML makes this easy).",
              '**Recursive** — try splitting on big separators (sections), fall back to smaller ones (paragraphs, sentences) until chunks fit the size budget. The pragmatic default in most frameworks.',
              "**Parent–child (small-to-big)** — embed small chunks for precise matching, but return their larger parent section to the LLM. Decouples 'what matches well' from 'what reads well'.",
            ],
          },
        ],
      },
      {
        heading: 'Special content needs special treatment',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Code**: split on functions/classes, never mid-block; include imports or signatures for context.',
              '**Tables**: keep header rows with every chunk of rows, or serialize rows into sentences — a table split naively is gibberish.',
              '**Contracts/legal**: clause boundaries matter; a clause split in half can invert its meaning.',
              '**Chat logs / tickets**: chunk by conversation or issue, not by token count.',
            ],
          },
          {
            kind: 'p',
            text: "Two upgrades pay off almost everywhere: **prepend heading paths** to each chunk ('Billing > Refunds > Annual plans: …') so context travels with the text, and consider **contextual enrichment** — using a cheap LLM pass to prepend a one-line summary situating each chunk in its document. It costs pennies at index time and measurably lifts retrieval.",
          },
        ],
      },
      {
        heading: 'Tune with data, not vibes',
        blocks: [
          {
            kind: 'p',
            text: "Build a small retrieval eval: 30–50 real questions, each labeled with the chunk(s) that should be found. Measure recall@k across chunking configurations. It's an afternoon of work and turns chunking from folklore into a measured decision — you will usually be surprised by which configuration wins.",
          },
        ],
      },
    ],
    takeaways: [
      "Chunks are the unit of retrieval — small matches precisely, large carries context; you're always trading between them.",
      'Recursive splitting on document structure is the pragmatic default; fixed-size + overlap is a strong baseline.',
      'Parent–child chunking decouples matching precision from reading context.',
      'Code, tables, and legal text break naive splitters — chunk along their natural seams.',
      'Measure recall@k on labeled questions; never tune chunking by intuition alone.',
    ],
    goDeeper: [
      {
        label: 'Anthropic — contextual retrieval',
        url: 'https://www.anthropic.com/news/contextual-retrieval',
      },
    ],
  },
  {
    slug: 'knowledge-qa',
    title: 'Building Knowledge Q&A',
    tagline: 'From naive RAG to a pipeline users actually trust',
    intro:
      'A demo that answers questions is a weekend project; a system your colleagues trust with real work needs hybrid retrieval, reranking, citations, and honest refusals. This lesson assembles the full production pipeline from the pieces this track has built.',
    module: 'retrieval',
    minutes: 8,
    sections: [
      {
        heading: 'Upgrade 1 — hybrid retrieval',
        blocks: [
          {
            kind: 'p',
            text: "Pure vector search misses exact identifiers ('error E4021', 'invoice-2024-119'); pure keyword search misses paraphrases. Production Q&A runs both — BM25 and embeddings — and merges the ranked lists (reciprocal rank fusion is the standard trick). Each catches what the other drops.",
          },
        ],
      },
      {
        heading: 'Upgrade 2 — retrieve wide, then rerank',
        blocks: [
          {
            kind: 'p',
            text: 'First-stage retrieval optimises for speed across millions of chunks, so its ranking is rough. The fix: over-retrieve (say, 50 candidates), then apply a **reranker** — a cross-encoder that reads query and passage *together* and scores actual relevance. Keep the top 3–5. This two-stage design (cheap-and-wide, then expensive-and-narrow) is the single highest-impact upgrade to most RAG systems.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Also: rewrite the query',
            text: "User questions are often terrible search queries — full of pronouns and conversation context ('does that also apply to annual plans?'). A fast LLM call that rewrites the question into a standalone query, using chat history, fixes a whole class of retrieval misses.",
          },
        ],
      },
      {
        heading: 'Upgrade 3 — citations and honest refusal',
        blocks: [
          {
            kind: 'p',
            text: "Trust comes from verifiability. Number the retrieved passages, require the model to cite them per claim, and render citations as links to the source. Equally important is the refusal path: when reranker scores are weak, instruct the model to say it doesn't know — and route those questions to a human or a feedback queue. An honest 'I don't know' retains users; a confident fabrication loses them permanently.",
          },
          {
            kind: 'code',
            lang: 'text',
            code: 'Rules:\n1. Answer ONLY from the numbered context passages.\n2. Cite passages like [2] after each claim they support.\n3. If the passages don\'t contain the answer, reply:\n   "I couldn\'t find this in the knowledge base" — and suggest\n   what to search for or whom to ask.',
          },
        ],
      },
      {
        heading: 'Operate it like a product',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Freshness**: re-index on document change events, not on a quarterly cron.',
              "**Permissions**: filter retrieval by the asking user's access — at query time, in the database.",
              '**Feedback loop**: log thumbs-down answers with their retrieved chunks; they become eval cases and reveal whether retrieval or generation failed.',
              '**Metrics that matter**: retrieval recall@k, answer faithfulness (an LLM judge can grade this), refusal correctness, and time-to-answer.',
            ],
          },
          {
            kind: 'p',
            text: 'Notice the theme: nothing here is exotic. Production knowledge Q&A is ordinary engineering discipline — indexes, permissions, logging, evals — wrapped around the RAG core you already understand.',
          },
        ],
      },
    ],
    takeaways: [
      'Hybrid search (BM25 + vectors) with rank fusion catches what each method misses.',
      'Two-stage retrieval — over-fetch then rerank with a cross-encoder — is the highest-impact upgrade.',
      'Rewrite conversational questions into standalone search queries before retrieving.',
      'Citations per claim plus honest refusals are what make users trust the system.',
      'Log, measure, and re-index continuously — Q&A quality is an operations problem after launch.',
    ],
    goDeeper: [
      {
        label: 'Reciprocal rank fusion explained',
        url: 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf',
      },
    ],
  },
]
