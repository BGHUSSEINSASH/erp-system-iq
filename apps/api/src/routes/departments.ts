import { departments } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => departments, (v) => { departments.length = 0; departments.push(...v); }, "d");
