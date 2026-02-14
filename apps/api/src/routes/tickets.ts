import { tickets } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => tickets, (v) => { tickets.length = 0; tickets.push(...v); }, "t");
