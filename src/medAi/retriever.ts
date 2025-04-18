import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

export const createRetriever = async () => {
  try {
    // Validate environment variables
    const { HUGGINGFACEHUB_API_KEY } = process.env;

    if (!HUGGINGFACEHUB_API_KEY) {
      throw new Error(
        "❌ HUGGINGFACEHUB_API_KEY is not defined in the environment variables."
      );
    }

    // Create embeddings instance
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: HUGGINGFACEHUB_API_KEY,
    });

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.index("medmap");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    const retriever = vectorStore.asRetriever({
      k: 2,
    });

    return retriever;
  } catch (error) {
    console.error("❌ Failed to create retriever:", error);
    throw error; // rethrow so caller knows it failed
  }
};
