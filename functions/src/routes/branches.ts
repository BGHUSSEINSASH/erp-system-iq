import { branches } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => branches, (v) => { branches.length = 0; branches.push(...v); }, "br");
