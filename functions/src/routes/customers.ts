import { customers } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => customers, (v) => { customers.length = 0; customers.push(...v); }, "c");
