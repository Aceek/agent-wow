import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { initializeAgent } from "./agent.js";
import dotenv from 'dotenv';
import readline from 'readline';
import { Client } from "langsmith";

dotenv.config();

// Initialize Langsmith client
const client = new Client();

async function main() {
  const model = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const memory = new BufferMemory();
  const agentExecutor = await initializeAgent(model, memory);

  console.log("Bienvenue dans l'agent conversationnel WoW ! Posez vos questions sur les joueurs ou les stratégies.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    rl.question('Vous: ', async (input) => {
      if (input.toLowerCase() === 'quitter') {
        console.log('Au revoir !');
        rl.close();
        return;
      }

      try {
        const response = await agentExecutor.invoke(
          { input },
          {
            callbacks: [
              {
                handleChainEnd: async (outputs) => {
                  await client.createRun({
                    name: "WoW Agent Conversation",
                    inputs: { question: input },
                    outputs: outputs,
                    runtime: "nodejs",
                    project: process.env.LANGCHAIN_PROJECT,
                  });
                },
              },
            ],
          }
        );
        console.log(`Agent: ${response.output}`);
      } catch (error) {
        console.error("Une erreur s'est produite:", error);
      }
      askQuestion();
    });
  };

  askQuestion();
}

main().catch((error) => console.error(error));
