import type { AIProvider } from "./providers/types";

export type { ExtractionResult, VehicleInfo, DraftInput } from "./providers/types";

function getProvider(): AIProvider {
  const useAnthropic = process.env.AI_PROVIDER_ANTHROPIC === "true";
  const useOpenAI = process.env.AI_PROVIDER_OPENAI === "true";

  if (useOpenAI) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { openaiProvider } = require("./providers/openai");
    return openaiProvider;
  }

  if (useAnthropic) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { anthropicProvider } = require("./providers/anthropic");
    return anthropicProvider;
  }

  // Default to anthropic
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { anthropicProvider } = require("./providers/anthropic");
  return anthropicProvider;
}

export function getAI(): AIProvider {
  return getProvider();
}
