import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

export const loadDocuments = async () => {
  const loader = new DirectoryLoader("scripts/data", {
    ".csv": (path) => new CSVLoader(path),
  });
  const docs = await loader.load();
  // console.log({ docs });

  return docs;
};
