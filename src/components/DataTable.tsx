import React from "react";
import "../styles/mf.css";

export type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
};

type Props<T> = {
  title?: string;
  actions?: React.ReactNode;

  data: T[];
  columns: Column<T>[];

  getRowId: (row: T) => string;

  onRowClick?: (row: T) => void;

  expandedRowId?: string | null;
  renderExpandedRow?: (row: T) => React.ReactNode;
};

function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return Boolean(
    el.closest(
      'input, select, textarea, button, a, label, option, [role="button"], [role="menuitem"], [contenteditable="true"]'
    )
  );
}

export function DataTable<T>(props: Props<T>) {
  const {
    title,
    actions,
    data,
    columns,
    getRowId,
    onRowClick,
    expandedRowId,
    renderExpandedRow,
  } = props;

  return (
    <div className="mf-card" style={{ padding: 14 }}>
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>{title ? <div className="mf-h1">{title}</div> : null}</div>
          {actions ? (
            <div style={{ display: "flex", gap: 10 }}>{actions}</div>
          ) : null}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.04)" }}>
              {columns.map((c, idx) => (
                <th
                  key={idx}
                  style={{
                    textAlign: c.align || "left",
                    padding: "10px 10px",
                    fontSize: 12,
                    color: "var(--mf-blue)",
                    letterSpacing: 0.2,
                    whiteSpace: "nowrap",
                    width: c.width,
                  }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const id = getRowId(row);
              const isExpanded = expandedRowId && expandedRowId === id;

              return (
                <React.Fragment key={id}>
                  <tr
                    onClick={(e) => {
                      if (isInteractiveTarget(e.target)) return;
                      onRowClick?.(row);
                    }}
                    style={{
                      cursor: onRowClick ? "pointer" : "default",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      background: isExpanded
                        ? "rgba(12,62,77,0.03)"
                        : "transparent",
                    }}
                  >
                    {columns.map((c, idx) => (
                      <td
                        key={idx}
                        style={{
                          padding: "10px 10px",
                          fontSize: 13,
                          textAlign: c.align || "left",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>

                  {isExpanded && renderExpandedRow ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{
                          padding: 12,
                          background: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
