import { emailNotifications } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => emailNotifications, (v) => { emailNotifications.length = 0; emailNotifications.push(...v); }, "en");
