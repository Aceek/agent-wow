import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { RaiderIoTool } from "./raiderIoTool.js";
import { StrategyTool } from "./strategyTool.js";
import { SearchTool } from "./searchTool.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const SYSTEM_MESSAGE = `Vous êtes un assistant spécialisé dans World of Warcraft, capable de fournir des informations sur les joueurs, les stratégies de boss et de donjons, ainsi que des informations générales sur le jeu.

Suivez ces étapes pour répondre aux questions :

1. Pour les questions sur les joueurs ou les guildes, utilisez d'abord le RaiderIoTool.
2. Pour les questions sur les stratégies de boss ou de donjons, utilisez d'abord le StrategyTool.
3. Si ces outils ne donnent pas de résultats satisfaisants ou si vous avez besoin d'informations supplémentaires, utilisez le SearchTool pour effectuer une recherche internet plus large.
4. Utilisez les informations obtenues pour formuler une réponse complète et informative.

Assurez-vous de toujours utiliser l'outil le plus approprié en premier lieu, et n'hésitez pas à combiner les informations de plusieurs outils si nécessaire pour fournir une réponse complète.`;

export async function initializeAgent(model, memory) {
  const tools = [
    new RaiderIoTool(),
    new StrategyTool(),
    new SearchTool(),
  ];

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_MESSAGE],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

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
