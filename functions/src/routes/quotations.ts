import { quotations } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

export default createCrudRouter(
  () => quotations,
  (items) => { quotations.length = 0; quotations.push(...items); },
  "q"
);
