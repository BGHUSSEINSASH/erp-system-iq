import { users } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

const router = createCrudRouter(
  () => users.map(({ password: _p, ...u }) => u as any),
  (v) => { users.length = 0; users.push(...v); },
  "u"
);

export default router;
