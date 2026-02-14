import { itAssets } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

export default createCrudRouter(
  () => itAssets,
  (items) => { itAssets.length = 0; itAssets.push(...items); },
  "ia"
);
