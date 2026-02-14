import { leaveRequests } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => leaveRequests, (v) => { leaveRequests.length = 0; leaveRequests.push(...v); }, "lr");
