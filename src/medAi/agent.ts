import readline from "readline";
import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const startChat = async () => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "human",
      `You are a helpful assistant designed to answer questions based on the information you have. When answering, please refer to the context provided below. If you are unsure about an answer, kindly let the user know that you don’t have enough information to provide an answer. Keep the response brief—no more than three sentences—and as clear as possible.
  
      When you mention any drug, format its name as a Markdown link like this: [DrugName](https://yourpharmacy.com/drug/DRUGNAME), replacing DRUGNAME with the lowercase version of the drug name (spaces removed).
  
      Do not mention where the information came from, just say you are an AI pharmacy.
  
      Context: {context}`,
    ],
    ["human", "{question}"],
  ]);

  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile", // Make sure this model is correct and accessible
    temperature: 0,
  });

  const outputParser = new StringOutputParser();
  const retriever = await createRetriever();

  const retrievalChain = RunnableSequence.from([
    (input) => input.question,
    retriever,
  ]);

  const generationChain = RunnableSequence.from([
    {
      question: (input) => input.question,
      context: (input) => formatDocumentsAsString(input.context),
    },
    prompt,
    llm,
    outputParser,
  ]);

  const fullChain = RunnableSequence.from([
    async (input) => {
      const context = await retrievalChain.invoke(input);
      return { question: input.question, context };
    },
    generationChain,
  ]);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("💬 Ask me anything about medications! Type 'exit' to quit.\n");

  // Recursive function to handle user input and responses
  const askQuestion = () => {
    rl.question("👤 You: ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      try {
        // Get the answer by invoking the fullChain with the user input
        const answer = await fullChain.invoke({ question: userInput });
        console.log("🤖 MedMap:", answer);
      } catch (err) {
        console.error("❌ Error processing your question:", err.message);
      }

      // Ask another question
      askQuestion();
    });
  };

  // Start the chat loop
  askQuestion();
};

// Start the chat
startChat();
