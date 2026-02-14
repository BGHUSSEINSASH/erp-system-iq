import { receivableAccounts } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => receivableAccounts, (v) => { receivableAccounts.length = 0; receivableAccounts.push(...v); }, "ra");
