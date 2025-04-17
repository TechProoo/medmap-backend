import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { loadDocuments } from "./loadDocuments";
import { splitDocuments } from "./splitDocuments";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

// 1. Initialize Supabase client
if (!process.env.SUPABASE_PRIVATE_KEY) {
  console.error(
    "❌ SUPABASE_PRIVATE_KEY is not defined in the environment variables."
  );
  process.exit(1);
}

if (!process.env.SUPABASE_URL) {
  console.error("❌ SUPABASE_URL is not defined in the environment variables.");
  process.exit(1);
}

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PRIVATE_KEY
);

// 2. Load and split documents
const rawDocuments = await loadDocuments();

const chunkedDocuments = await splitDocuments(rawDocuments);

console.log(
  `${rawDocuments.length} documents split into ${chunkedDocuments.length} chunks.`
);

const embeddingsLLM = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY, // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
});


// 4. Prepare text for embedding
const texts = chunkedDocuments.map((doc) => doc.pageContent);

// 5. Embed in batches with progress bar
console.log("🔄 Starting Vectorization with Cohere...");
const progressBar = new cliProgress.SingleBar({
  format: "Progress |{bar}| {percentage}% || {value}/{total} Chunks",
});
progressBar.start(texts.length, 0);

const batchSize = 100;
const allEmbeddings: number[][] = [];

for (let i = 0; i < texts.length; i += batchSize) {
  const batch = texts.slice(i, i + batchSize);

  try {
    const embeddings = await embeddingsLLM.embedDocuments(batch);
    allEmbeddings.push(...embeddings);
    progressBar.increment(batch.length);
  } catch (err) {
    console.error("❌ Embedding error at batch", i, err);
    break;
  }
}

progressBar.stop();
console.log("✅ Embedding complete.");

// 6. Store chunks in Supabase vector store
console.log("🔄 Storing chunks in Supabase vector store...");
const vectorStore = SupabaseVectorStore.fromDocuments(
  chunkedDocuments,
  embeddingsLLM,
  {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  }
);

console.log("✅ Chunks stored in Supabase vector store.");
