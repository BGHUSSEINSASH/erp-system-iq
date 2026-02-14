import { costRecords } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => costRecords, (v) => { costRecords.length = 0; costRecords.push(...v); }, "cr");
