import { properties } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => properties, (v) => { properties.length = 0; properties.push(...v); }, "prop");
