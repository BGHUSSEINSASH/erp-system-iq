import { crmContacts } from "../data/newFeatures.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => crmContacts, (v) => { crmContacts.length = 0; crmContacts.push(...v); }, "crm");
