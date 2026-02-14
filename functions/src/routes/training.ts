import { trainingPrograms } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => trainingPrograms, (v) => { trainingPrograms.length = 0; trainingPrograms.push(...v); }, "trn");
