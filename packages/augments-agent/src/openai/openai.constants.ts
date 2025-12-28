import { BytebotAgentModel } from 'src/agent/agent.types';

export const OPENAI_MODELS: BytebotAgentModel[] = [
  {
    provider: 'openai',
    name: 'gpt-5',
    title: 'GPT-5',
    contextWindow: 200000,
  },
  {
    provider: 'openai',

    name: 'gpt-4o',
    title: 'GPT-4o',
    contextWindow: 128000,
  },
  {
    provider: 'openai',
    name: 'gpt-4o-mini',
    title: 'GPT-4o Mini',
    contextWindow: 128000,
  },
];

export const DEFAULT_MODEL = OPENAI_MODELS[0];
