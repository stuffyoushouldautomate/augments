import { BytebotAgentModel } from '../agent/agent.types';

export const OPENROUTER_MODELS: BytebotAgentModel[] = [
  {
    provider: 'openrouter',
    name: 'anthropic/claude-3.5-sonnet',
    title: 'Claude 3.5 Sonnet (OpenRouter)',
    contextWindow: 200000,
  },
  {
    provider: 'openrouter',
    name: 'anthropic/claude-3.5-haiku',
    title: 'Claude 3.5 Haiku (OpenRouter)',
    contextWindow: 200000,
  },
  {
    provider: 'openrouter',
    name: 'openai/gpt-4o',
    title: 'GPT-4o (OpenRouter)',
    contextWindow: 128000,
  },
  {
    provider: 'openrouter',
    name: 'openai/gpt-4o-mini',
    title: 'GPT-4o Mini (OpenRouter)',
    contextWindow: 128000,
  },
  {
    provider: 'openrouter',
    name: 'google/gemini-pro-1.5',
    title: 'Gemini Pro 1.5 (OpenRouter)',
    contextWindow: 2000000,
  },
];

export const DEFAULT_MODEL = OPENROUTER_MODELS[0];
