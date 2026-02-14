import { vehicles } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => vehicles, (v) => { vehicles.length = 0; vehicles.push(...v); }, "veh");
