import { staffNotifications } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => staffNotifications, (v) => { staffNotifications.length = 0; staffNotifications.push(...v); }, "sn");
