import { timesheets } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => timesheets, (v) => { timesheets.length = 0; timesheets.push(...v); }, "ts");
