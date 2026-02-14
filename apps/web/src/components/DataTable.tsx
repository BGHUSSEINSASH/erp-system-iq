import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

export default function DataTable<T extends Record<string, unknown>>({ columns, data, onEdit, onDelete }: Props<T>) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {(onEdit || onDelete) && <th>إجراءات / Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="empty-row">
                لا توجد بيانات / No data available
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={(row as any).id ?? idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key] ?? "")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="action-cell">
                  {onEdit && (
                    <button className="btn-sm btn-edit" onClick={() => onEdit(row)}>
                      ✏️ تعديل
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn-sm btn-delete" onClick={() => onDelete(row)}>
                      🗑️ حذف
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
