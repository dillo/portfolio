import { createElement, type ComponentType } from 'react'
import {
  EmbeddingsDiagram,
  LlmConceptsDiagram,
  PromptEngineeringDiagram,
  StructuredOutputsDiagram,
} from './foundations'
import { ChunkingDiagram, KnowledgeQaDiagram, RagDiagram, VectorDbDiagram } from './retrieval'
import {
  AgentDesignDiagram,
  AgentLoopDiagram,
  AgentMemoryDiagram,
  AgenticPatternsDiagram,
  ContextEngineeringDiagram,
  McpDiagram,
  MultiAgentDiagram,
} from './agents'
import {
  DeploymentDiagram,
  EvalsDiagram,
  FinetuningDiagram,
  GuardrailsDiagram,
  SystemDesignDiagram,
} from './production'
import { AiCodingDiagram, ChatAssistantDiagram } from './practice'

/**
 * Diagrams are keyed by series then lesson slug, so slugs only need to be
 * unique within a series. A lesson without a diagram simply renders without one.
 */
const diagrams: Record<string, Record<string, ComponentType>> = {
  'ai-engineering': {
    'llm-concepts': LlmConceptsDiagram,
    'prompt-engineering': PromptEngineeringDiagram,
    'structured-outputs-tool-calling': StructuredOutputsDiagram,
    'embeddings-101': EmbeddingsDiagram,
    'how-rag-works': RagDiagram,
    'vector-database-101': VectorDbDiagram,
    'chunking-strategies': ChunkingDiagram,
    'knowledge-qa': KnowledgeQaDiagram,
    'how-ai-agents-work': AgentLoopDiagram,
    'agentic-patterns-101': AgenticPatternsDiagram,
    'ai-agent-design': AgentDesignDiagram,
    'agent-memory-and-state': AgentMemoryDiagram,
    'context-engineering': ContextEngineeringDiagram,
    'multi-agent-architectures': MultiAgentDiagram,
    'how-mcp-works': McpDiagram,
    'llm-evals': EvalsDiagram,
    'guardrails-and-safety': GuardrailsDiagram,
    'llm-system-design': SystemDesignDiagram,
    'production-deployment': DeploymentDiagram,
    'fine-tuning-and-rlhf': FinetuningDiagram,
    'ai-coding-workflow': AiCodingDiagram,
    'ai-chat-assistant': ChatAssistantDiagram,
  },
}

/**
 * Renders a lesson's diagram, or nothing when that lesson has none.
 *
 * The registry above holds module-level components, so the looked-up reference
 * is stable across renders; `createElement` keeps this a registry dispatch
 * rather than something the lint rules read as defining a component inline.
 */
export function LessonDiagram({ seriesId, slug }: { seriesId: string; slug: string }) {
  const entry: ComponentType | undefined = diagrams[seriesId]?.[slug]
  if (!entry) return null
  return (
    <figure className="border-border bg-card overflow-x-auto rounded-lg border p-4 sm:p-6">
      {createElement(entry)}
    </figure>
  )
}
