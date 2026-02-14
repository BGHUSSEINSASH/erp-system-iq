import { invoices } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => invoices, (v) => { invoices.length = 0; invoices.push(...v); }, "inv");
