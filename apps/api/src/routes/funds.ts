import { funds } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => funds, (v) => { funds.length = 0; funds.push(...v); }, "f");
