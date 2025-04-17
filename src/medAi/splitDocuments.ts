import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadDocuments } from "./loadDocuments";

export async function splitDocuments(
  rawDocuments: Document[]
): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const documentChunks = await splitter.splitDocuments(rawDocuments);

  console.log(
    `${rawDocuments.length} documents split into ${documentChunks.length} chunks.`
  );

  return documentChunks;
}

const rawDocuments = await loadDocuments();

await splitDocuments(rawDocuments);
