import { fixedAssets } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => fixedAssets, (v) => { fixedAssets.length = 0; fixedAssets.push(...v); }, "fa");
