import { inventoryItems } from "../data/extended.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => inventoryItems, (v) => { inventoryItems.length = 0; inventoryItems.push(...v); }, "ii");
