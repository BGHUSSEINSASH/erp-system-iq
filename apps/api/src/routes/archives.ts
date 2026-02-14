import { archiveDocuments } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => archiveDocuments, (v) => { archiveDocuments.length = 0; archiveDocuments.push(...v); }, "arc");
