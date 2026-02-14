import { projects } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => projects, (v) => { projects.length = 0; projects.push(...v); }, "prj");
