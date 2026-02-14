import { accounts } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => accounts, (v) => { accounts.length = 0; accounts.push(...v); }, "ac");
