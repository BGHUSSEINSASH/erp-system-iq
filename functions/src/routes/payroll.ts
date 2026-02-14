import { payrollRecords } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => payrollRecords, (v) => { payrollRecords.length = 0; payrollRecords.push(...v); }, "pr");
