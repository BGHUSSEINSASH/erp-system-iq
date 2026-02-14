import { leaseAgreements } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => leaseAgreements, (v) => { leaseAgreements.length = 0; leaseAgreements.push(...v); }, "la");
