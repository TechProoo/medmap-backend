import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";
import { loadDocuments } from "./loadDocuments";
import { splitDocuments } from "./splitDocuments";
dotenv.config();

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-v4.0",
});

const rawDocuments = await loadDocuments();
const chunkedDocuments = await splitDocuments(rawDocuments);
