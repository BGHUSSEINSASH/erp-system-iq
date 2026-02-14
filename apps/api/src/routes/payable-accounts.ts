import { payableAccounts } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => payableAccounts, (v) => { payableAccounts.length = 0; payableAccounts.push(...v); }, "pa");
