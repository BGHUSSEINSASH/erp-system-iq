import { employees } from "../data/store.js";
import { createCrudRouter } from "./crud.js";
export default createCrudRouter(() => employees, (v) => { employees.length = 0; employees.push(...v); }, "e");
