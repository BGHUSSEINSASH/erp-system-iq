import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";

type Att = { id: string; employeeName: string; date: string; checkIn: string; checkOut: string; status: string };

export default function Attendance() {
  const { t } = useI18n();
  const columns: Column<Att>[] = [
    { key: "employeeName", header: t("field.employee") },
    { key: "date", header: t("date") },
    { key: "checkIn", header: t("field.checkIn") },
    { key: "checkOut", header: t("field.checkOut") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Att[]>([]);
  useEffect(() => { get<{ items: Att[] }>("/attendance").then((r) => setItems(r.items)); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.attendance")}</h2>
        <p className="page-subtitle">{t("field.todayAttendance")}</p>
      </div>
      <DataTable columns={columns} data={items} />
    </div>
  );
}
