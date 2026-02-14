import { purchaseOrders } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => purchaseOrders, (v) => { purchaseOrders.length = 0; purchaseOrders.push(...v); }, "po");
