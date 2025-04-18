import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import * as hub from "langchain/hub/node";

(async () => {
  const prompt = await hub.pull("rlm/rag-prompt");

  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  });

  const outputParser = new StringOutputParser();
  const retriever = await createRetriever();

  const retrievalChain = retriever.pipe(async (input) => input); // Pass a valid RunnableLike argument

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
      const context = await retrievalChain.invoke(input.question);
      return { question: input.question, context };
    },
    generationChain,
  ]);

  const testQuestion = "What drug can i use for Malaria?";
  const answer = await fullChain.invoke({ question: testQuestion });

  console.log("🧠 Answer:", answer);
})();
