import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { loadDocuments } from "./loadDocuments";
import { splitDocuments } from "./splitDocuments";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

// Load environment variables
dotenv.config();

(async () => {
  // 1. Check environment variables
  const { HUGGINGFACEHUB_API_KEY } = process.env;

  if (!HUGGINGFACEHUB_API_KEY) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
  }

  // 3. Load and split documents
  const rawDocuments = await loadDocuments();
  const chunkedDocuments = await splitDocuments(rawDocuments);
  console.log(
    `${rawDocuments.length} documents split into ${chunkedDocuments.length} chunks.`
  );

  // 4. Set up embedding model
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: HUGGINGFACEHUB_API_KEY,
  });

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("medmap");

  console.log("Starting Vecrotization...");
  const progressBar = new cliProgress.SingleBar({});
  progressBar.start(chunkedDocuments.length, 0);

  for (let i = 0; i < chunkedDocuments.length; i = i + 100) {
    const batch = chunkedDocuments.slice(i, i + 100);
    await PineconeStore.fromDocuments(batch, embeddings, {
      pineconeIndex,
    });

    progressBar.increment(batch.length);
  }

  progressBar.stop();
  console.log("Chunked documents stored in pinecone.");
})();
