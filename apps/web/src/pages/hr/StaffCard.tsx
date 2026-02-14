import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";

type Emp = { id: string; name: string; email: string; phone: string; department: string; position: string; salary: number; hireDate: string; status: string };

export default function StaffCard() {
  const { t } = useI18n();
  const columns: Column<Emp>[] = [
    { key: "name", header: t("name") },
    { key: "department", header: t("field.department") },
    { key: "position", header: t("field.position") },
    { key: "email", header: t("email") },
    { key: "phone", header: t("phone") },
    { key: "hireDate", header: t("field.hireDate") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Emp[]>([]);
  useEffect(() => { get<{ items: Emp[] }>("/employees").then((r) => setItems(r.items)); }, []);

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.staffCard")}</h2></div>
      <DataTable columns={columns} data={items} />
    </div>
  );
}
