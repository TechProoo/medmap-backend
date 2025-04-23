// medai.agent.ts
import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
});

export const startChat = async (question: string, context: string) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful AI pharmacy assistant. Your job is to answer user questions based on the provided context below. Do not offer medical advice or diagnosis—only factual information from the context.
  
  If you don’t have enough information to answer a question, say so clearly. Keep all responses concise (no more than three sentences) and easy to understand.
  
  When referencing a drug, format the name as a Markdown link like this: [DrugName](/search?query=drugname), where "drugname" is the lowercase version with spaces and special characters removed. Only make the link if the drug name is mentioned in the context.
  
  Do not mention where the information came from or refer to the context explicitly.`,
    ],
    ["human", "{question}"],
  ]);
  

  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    apiKey: "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",
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
  const result = await fullChain.invoke({ question, context });
  return result;
};
