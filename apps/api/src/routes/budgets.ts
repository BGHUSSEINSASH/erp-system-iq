import { budgets } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

export default createCrudRouter(
  () => budgets,
  (items) => { budgets.length = 0; budgets.push(...items); },
  "bud"
);
