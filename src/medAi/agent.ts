
import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Server as SocketIOServer } from "socket.io";
import { server } from "../app"; // Adjust the import based on your project structure

const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Change to your frontend URL if you want to restrict CORS
    methods: ["GET", "POST"],
  },
});

let botReply = "Hello from MedAi!"; // Example bot reply (default)

// Define your chatbot logic
const startChat = async (question: string, context: string) => {
  try {
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
      model: "llama-3.3-70b-versatile", // Ensure this model is correct and accessible
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

    const result = await fullChain.invoke({ question, context });
    return result;
  } catch (error) {
    console.error("Error in startChat:", error);
    throw new Error("Failed to process the chat request.");
  }
};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("user-message", async ({ message, context }) => {
    try {
      console.log("User message:", message);
      console.log("Context:", context);

      // Generate the bot's response
      const botResponse = await startChat(message, context);

      // Emit the bot's response back to the user
      socket.emit("bot-message", { message: botResponse });
    } catch (error) {
      console.error("Error handling user message:", error);
      socket.emit("bot-message", { message: "Sorry, something went wrong!" });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

