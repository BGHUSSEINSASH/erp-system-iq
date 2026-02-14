/* Generic CRUD router factory – with data isolation */
import { Router, type Request, type Response } from "express";
import { nextId } from "../data/store.js";

/**
 * Data isolation rules:
 *  - admin / ceo / manager → see everything
 *  - dept_manager / dept_assistant → see their department + own records
 *  - regular staff → see only their own records
 *  - Records without createdBy → visible to everyone (legacy/demo data)
 *
 * Identity is passed via query params: _user, _role, _dept
 * (auto-appended by the frontend api.ts helper)
 */

function filterItems<T>(items: T[], req: Request): T[] {
  const role = (req.query._role as string) || "";
  const user = (req.query._user as string) || "";
  const dept = (req.query._dept as string) || "";

  // Admin / CEO / Manager → see everything
  if (!role || ["admin", "ceo", "manager"].includes(role)) return items;

  const isDeptHead = role.endsWith("_manager") || role.endsWith("_assistant");

  return items.filter((item: any) => {
    // No ownership tracking → legacy/demo data → show to all
    if (!item.createdBy) return true;
    // Created by this user → always show
    if (item.createdBy === user) return true;
    // Department head can see their department's data
    if (isDeptHead && item.createdByDept && item.createdByDept === dept) return true;
    return false;
  });
}

export function createCrudRouter<T extends { id: string }>(
  getData: () => T[],
  setData: (items: T[]) => void,
  prefix: string
) {
  const router = Router();

  /* LIST – with data isolation */
  router.get("/", (req: Request, res: Response) => {
    const items = filterItems(getData(), req);
    res.json({ items, total: items.length });
  });

  /* GET by id */
  router.get("/:id", (req: Request, res: Response) => {
    const item = getData().find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    return res.json(item);
  });

  /* CREATE – auto-stamp createdBy */
  router.post("/", (req: Request, res: Response) => {
    const user = (req.query._user as string) || req.body.createdBy || "";
    const dept = (req.query._dept as string) || req.body.createdByDept || "";
    const item = {
      ...req.body,
      id: nextId(prefix),
      createdBy: user,
      createdByDept: dept,
    } as T;
    const data = getData();
    data.push(item);
    setData(data);
    return res.status(201).json(item);
  });

  /* UPDATE */
  router.put("/:id", (req: Request, res: Response) => {
    const data = getData();
    const idx = data.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    data[idx] = { ...data[idx], ...req.body, id: data[idx].id };
    setData(data);
    return res.json(data[idx]);
  });

  /* DELETE */
  router.delete("/:id", (req: Request, res: Response) => {
    const data = getData();
    const idx = data.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    data.splice(idx, 1);
    setData(data);
    return res.status(204).send();
  });

  return router;
}
