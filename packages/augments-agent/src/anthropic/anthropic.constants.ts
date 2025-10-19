import { BytebotAgentModel } from '../agent/agent.types';

export const ANTHROPIC_MODELS: BytebotAgentModel[] = [
  {
    provider: 'anthropic',
    name: 'claude-3-5-sonnet-20241022',
    title: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
  },
  {
    provider: 'anthropic',
    name: 'claude-3-5-haiku-20241022',
    title: 'Claude 3.5 Haiku',
    contextWindow: 200000,
  },
  {
    provider: 'anthropic',
    name: 'claude-3-opus-20240229',
    title: 'Claude 3 Opus',
    contextWindow: 200000,
  },
];

export const DEFAULT_MODEL = ANTHROPIC_MODELS[0];
