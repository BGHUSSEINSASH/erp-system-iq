import { recruitmentRequests } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => recruitmentRequests, (v) => { recruitmentRequests.length = 0; recruitmentRequests.push(...v); }, "rr");
