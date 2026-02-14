import { contracts } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

export default createCrudRouter(
  () => contracts,
  (items) => { contracts.length = 0; contracts.push(...items); },
  "con"
);
