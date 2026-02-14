import { Router, type Request, type Response } from "express";
import * as store from "../data/store.js";

const router = Router();

// Map user department codes to employee department names
const deptCodeToName: Record<string, string[]> = {
  hr: ["Human Resources"],
  finance: ["Finance"],
  sales: ["Sales"],
  it: ["IT"],
  purchasing: ["Procurement"],
  production: ["Production"],
  admin: ["Administration"],
  marketing: ["Marketing"],
};

router.get("/", (_req: Request, res: Response) => {
  const totalEmployees = store.employees.length;
  const totalDepartments = store.departments.length;
  const totalCustomers = store.customers.length;
  const totalVendors = store.vendors.length;
  const totalProducts = store.products.length;
  const openTickets = store.tickets.filter((t) => t.status === "open" || t.status === "in-progress").length;
  const pendingPOs = store.purchaseOrders.filter((p) => p.status === "pending").length;
  const unpaidInvoices = store.invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length;

  const totalRevenue = store.invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalExpenses = store.purchaseOrders.filter(p => p.status === "received").reduce((s, p) => s + p.total, 0);

  const today = new Date().toISOString().split("T")[0];
  const todayAtt = store.attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter((a) => a.status === "present").length;
  const absentToday = todayAtt.filter((a) => a.status === "absent").length;
  const lateToday = todayAtt.filter((a) => a.status === "late").length;
  const onLeave = todayAtt.filter((a) => a.status === "leave").length;
  const exceptionToday = todayAtt.filter((a) => a.status === "exception" || a.exceptionReason).length;

  const lowStock = store.products.filter((p) => p.stock <= p.minStock).length;

  const revenueByMonth = [
    { month: "Sep", value: 95000 },
    { month: "Oct", value: 112000 },
    { month: "Nov", value: 89000 },
    { month: "Dec", value: 134000 },
    { month: "Jan", value: 113000 },
    { month: "Feb", value: totalRevenue },
  ];

  const departmentHeadcount = store.departments.map((d) => ({
    name: d.name,
    count: d.employeeCount,
  }));

  // Build per-department attendance summary
  const deptAttendance = store.departments.map(dept => {
    const deptEmployees = store.employees.filter(e => e.department === dept.name);
    const deptEmpNames = deptEmployees.map(e => e.name);
    const deptTodayAtt = todayAtt.filter(a => deptEmpNames.includes(a.employeeName));

    return {
      department: dept.name,
      departmentId: dept.id,
      totalEmployees: dept.employeeCount,
      present: deptTodayAtt.filter(a => a.status === "present").length,
      absent: deptTodayAtt.filter(a => a.status === "absent").length,
      late: deptTodayAtt.filter(a => a.status === "late").length,
      leave: deptTodayAtt.filter(a => a.status === "leave").length,
      exception: deptTodayAtt.filter(a => a.status === "exception" || a.exceptionReason).length,
      checkedOut: deptTodayAtt.filter(a => a.checkOut && a.checkOut !== "").length,
      totalLateMinutes: deptTodayAtt.reduce((s, a) => s + (a.lateMinutes || 0), 0),
      employees: deptTodayAtt.map(a => ({
        name: a.employeeName,
        status: a.status,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        lateMinutes: a.lateMinutes || 0,
        exceptionReason: a.exceptionReason || "",
      })),
    };
  });

  return res.json({
    stats: {
      totalEmployees,
      totalDepartments,
      totalCustomers,
      totalVendors,
      totalProducts,
      openTickets,
      pendingPOs,
      unpaidInvoices,
      totalRevenue,
      totalExpenses,
      lowStock,
    },
    attendance: { presentToday, absentToday, lateToday, onLeave, exceptionToday },
    revenueByMonth,
    departmentHeadcount,
    deptAttendance,
  });
});

export default router;
