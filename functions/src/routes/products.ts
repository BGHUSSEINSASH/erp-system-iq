import { products } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => products, (v) => { products.length = 0; products.push(...v); }, "p");
