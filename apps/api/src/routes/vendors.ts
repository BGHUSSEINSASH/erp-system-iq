import { vendors } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => vendors, (v) => { vendors.length = 0; vendors.push(...v); }, "v");
