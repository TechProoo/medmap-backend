import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";
import { loadDocuments } from "./loadDocuments";
import { splitDocuments } from "./splitDocuments";
dotenv.config();

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-v4.0",
});

loadDocuments()
  .then((rawDocuments) => {
    console.log("Loaded documents:", rawDocuments);
    return rawDocuments;
  })
  .then(async (rawDocuments) => {
    const documentChunks = await splitDocuments(rawDocuments);
    console.log("Split documents:", documentChunks);
    return documentChunks;
  });
