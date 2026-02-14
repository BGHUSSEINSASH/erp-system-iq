import { journalEntries } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => journalEntries, (v) => { journalEntries.length = 0; journalEntries.push(...v); }, "je");
