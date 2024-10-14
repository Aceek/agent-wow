import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { RaiderIoTool } from "./raiderIoTool.js";
import { StrategyTool } from "./strategyTool.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

export async function initializeAgent(model, memory) {
  const tools = [
    new RaiderIoTool(),
    new StrategyTool(),
  ];

  // Pull the prompt from the Langchain Hub
  const prompt = await pull("hwchase17/openai-functions-agent");

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true,
  });

  return executor;
}
