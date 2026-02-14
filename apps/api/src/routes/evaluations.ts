import { staffEvaluations } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => staffEvaluations, (v) => { staffEvaluations.length = 0; staffEvaluations.push(...v); }, "se");
