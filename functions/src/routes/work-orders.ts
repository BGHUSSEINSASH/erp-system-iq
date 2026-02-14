import { workOrders } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

export default createCrudRouter(
  () => workOrders,
  (items) => { workOrders.length = 0; workOrders.push(...items); },
  "wo"
);
