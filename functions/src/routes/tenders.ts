import { Router } from "express";
import { tenders, tenderBids } from "../data/newFeatures.js";
import { nextId } from "../data/store.js";
import { createCrudRouter } from "./crud.js";

const tendersRouter = createCrudRouter(() => tenders, (v) => { tenders.length = 0; tenders.push(...v); }, "tnd");

/* Also handle bids */
tendersRouter.get("/:id/bids", (req, res) => {
  const bids = tenderBids.filter(b => b.tenderId === req.params.id);
  res.json({ items: bids, total: bids.length });
});

tendersRouter.post("/:id/bids", (req, res) => {
  const bid = { ...req.body, id: nextId("tb"), tenderId: req.params.id } as any;
  tenderBids.push(bid);
  res.status(201).json(bid);
});

export default tendersRouter;
