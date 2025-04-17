import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

const loader = new DirectoryLoader("data", {
  ".csv": (path) => new CSVLoader(path),
});
const docs = await loader.load();
console.log({ docs });
