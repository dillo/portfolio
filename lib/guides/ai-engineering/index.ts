import type { Module, Series } from '../types'
import { foundations } from './foundations'
import { retrieval } from './retrieval'
import { agents } from './agents'
import { production } from './production'
import { practice } from './practice'

const modules: Module[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'How LLMs actually work — tokens, prompts, structure, and vectors.',
  },
  {
    id: 'retrieval',
    title: 'Knowledge & Retrieval',
    blurb: 'Grounding models in your data: RAG, vector search, and Q&A systems.',
  },
  {
    id: 'agents',
    title: 'Agents',
    blurb: 'Loops, tools, memory, context, and coordination between agents.',
  },
  {
    id: 'production',
    title: 'Quality & Production',
    blurb: 'Evals, guardrails, system design, and shipping with confidence.',
  },
  {
    id: 'practice',
    title: 'Practice',
    blurb: 'Putting it together: coding with agents and building a real assistant.',
  },
]

export const aiEngineering: Series = {
  id: 'ai-engineering',
  title: 'AI Engineering',
  blurb: 'From the next-token loop to agents you can ship.',
  intro:
    'A working engineer’s path through applied AI: how language models behave, how to ground them in your own data, how agents actually run, and what it takes to put any of it in production.',
  accent: 'accent',
  modules,
  // Curriculum order — also the prev/next reading order within the series.
  lessons: [...foundations, ...retrieval, ...agents, ...production, ...practice],
}
