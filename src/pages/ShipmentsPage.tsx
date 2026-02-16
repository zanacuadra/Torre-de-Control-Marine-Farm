import React, { useMemo, useState } from "react";
import DataTable, { type Column } from "../components/DataTable";
import type { Shipment, DocsStatus, AuditEntry } from "../types";

type Props = {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  onConfirmDelivered?: (shipmentId: string) => void;
};

function nowIso() {
  return new Date().toISOString();
}

function pushAudit(
  prev: AuditEntry[] | undefined,
  entry: AuditEntry
): AuditEntry[] {
  return [...(prev || []), entry];
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function etaDays(etaIso?: string) {
  if (!etaIso) return null;
  const today = startOfToday();
  const eta = new Date(etaIso);
  if (Number.isNaN(eta.getTime())) return null;
  eta.setHours(0, 0, 0, 0);
  return daysBetween(today, eta);
}

function docsLabel(s: DocsStatus) {
  if (s === "PEND") return "PENDIENTE";
  if (s === "DRAFT ENVIADO") return "DRAFT ENVIADO";
  return "OK";
}

function docsPillClass(s: DocsStatus) {
  if (s === "OK") return "mf-pill mf-pill-green";
  if (s === "DRAFT ENVIADO") return "mf-pill mf-pill-yellow";
  return "mf-pill mf-pill-red";
}

function nextDocsStatus(s: DocsStatus): DocsStatus {
  if (s === "PEND") return "DRAFT ENVIADO";
  if (s === "DRAFT ENVIADO") return "OK";
  return "PEND";
}

export default function ShipmentsPage(props: Props) {
  const { shipments, setShipments, onConfirmDelivered } = props;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ✅ Modal Bitácora
  const [logOpen, setLogOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<Shipment | null>(null);

  // ✅ Siempre ordenar por ETA asc (requisito)
  const sorted = useMemo(() => {
    const arr = [...(shipments || [])];
    arr.sort((a, b) => {
      const aa = a.eta || "9999-12-31";
      const bb = b.eta || "9999-12-31";
      return aa.localeCompare(bb);
    });
    return arr;
  }, [shipments]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function updateShipment(
    id: string,
    patch: Partial<Shipment>,
    auditMessage?: string
  ) {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next: Shipment = { ...s, ...patch };
        if (auditMessage) {
          next.auditLog = pushAudit(next.auditLog, {
            ts: nowIso(),
            module: "SHIPMENTS",
            by: "USER",
            message: auditMessage,
          });
        }
        return next;
      })
    );
  }

  function toggleDocs(id: string) {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = nextDocsStatus(s.docsStatus);
        return {
          ...s,
          docsStatus: nextStatus,
          auditLog: pushAudit(s.auditLog, {
            ts: nowIso(),
            module: "SHIPMENTS",
            by: "USER",
            message: `Docs Status actualizado → ${docsLabel(nextStatus)}.`,
          }),
        };
      })
    );
  }

  function openLog(sh: Shipment) {
    setLogTarget(sh);
    setLogOpen(true);
  }

  const columns: Column<Shipment>[] = useMemo(
    () => [
      // ✅ Primero PI y Cliente
      { header: "PI", render: (r) => <b>{r.pi || "—"}</b> },
      { header: "Cliente", render: (r) => r.customer },

      // ✅ Luego ETA pero la tabla sigue ordenada por ETA (sorted)
      { header: "ETA", render: (r) => r.eta },

      {
        header: "Días",
        render: (r) => {
          const d = etaDays(r.eta);
          if (typeof d !== "number") return <span className="mf-muted">—</span>;
          const cls =
            d < 0
              ? "mf-pill mf-pill-red"
              : d <= 10
              ? "mf-pill mf-pill-yellow"
              : "mf-pill mf-pill-green";
          return <span className={cls}>{d}</span>;
        },
      },

      { header: "País", render: (r) => r.country },
      { header: "Destino", render: (r) => r.destination },
      { header: "Producto", render: (r) => r.product },

      {
        header: "Docs",
        render: (r) => (
          <span className={docsPillClass(r.docsStatus)}>
            {docsLabel(r.docsStatus)}
          </span>
        ),
      },

      {
        header: "Booking",
        render: (r) => r.booking || <span className="mf-muted">—</span>,
      },
      {
        header: "ETD",
        render: (r) => r.etd || <span className="mf-muted">—</span>,
      },
    ],
    []
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DataTable
        title="Tránsito (ETD / ETA / Docs)"
        data={sorted}
        columns={columns}
        getRowId={(r) => r.id}
        expandedRowId={expandedId || undefined}
        onRowClick={(row) => toggleExpand(row.id)}
        renderExpandedRow={(expanded) => (
          <div
            data-no-row-click="true"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => toggleDocs(expanded.id)}
                title="Cambiar estado de documentos"
              >
                Toggle Docs: {docsLabel(expanded.docsStatus)}
              </button>

              {/* ✅ NUEVO: Bitácora */}
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => openLog(expanded)}
              >
                Bitácora
              </button>

              {onConfirmDelivered ? (
                <button
                  className="mf-btn mf-btn-primary"
                  onClick={() => onConfirmDelivered(expanded.id)}
                  title="Confirmar entregado en destino"
                >
                  Confirmar OK (Entregado)
                </button>
              ) : null}
            </div>

            <div className="mf-kv">
              <div className="k">PI</div>
              <div className="v">
                <b>{expanded.pi || "—"}</b>
              </div>

              <div className="k">Cliente</div>
              <div className="v">{expanded.customer}</div>

              <div className="k">Docs Status</div>
              <div className="v">
                <span className={docsPillClass(expanded.docsStatus)}>
                  {docsLabel(expanded.docsStatus)}
                </span>
              </div>

              <div className="k">Booking (editable)</div>
              <div className="v">
                <input
                  value={expanded.booking || ""}
                  onChange={(e) =>
                    updateShipment(expanded.id, { booking: e.target.value })
                  }
                  onBlur={() =>
                    updateShipment(expanded.id, {}, "Booking actualizado.")
                  }
                  style={inputStyle}
                  placeholder="Booking"
                />
              </div>

              <div className="k">ETD (editable)</div>
              <div className="v">
                <input
                  value={expanded.etd || ""}
                  onChange={(e) =>
                    updateShipment(expanded.id, { etd: e.target.value })
                  }
                  onBlur={() =>
                    updateShipment(expanded.id, {}, "ETD actualizado.")
                  }
                  style={inputStyle}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="k">ETA (editable)</div>
              <div className="v">
                <input
                  value={expanded.eta || ""}
                  onChange={(e) =>
                    updateShipment(expanded.id, { eta: e.target.value })
                  }
                  onBlur={() =>
                    updateShipment(expanded.id, {}, "ETA actualizado.")
                  }
                  style={inputStyle}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          </div>
        )}
      />

      {/* ✅ Modal Bitácora (Tránsito) */}
      {logOpen && logTarget ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 999,
          }}
          onClick={() => setLogOpen(false)}
        >
          <div
            className="mf-card"
            style={{ width: "min(760px, 100%)", padding: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    color: "var(--mf-blue)",
                    fontSize: 16,
                  }}
                >
                  Bitácora del Tránsito
                </div>
                <div
                  className="mf-muted"
                  style={{ marginTop: 6, fontSize: 13 }}
                >
                  {logTarget.pi || "—"} • {logTarget.customer} • {logTarget.id}
                </div>
              </div>
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => setLogOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                maxHeight: "60vh",
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[...(logTarget.auditLog || [])].reverse().length ? (
                [...(logTarget.auditLog || [])].reverse().map((e, idx) => (
                  <div
                    key={idx}
                    className="mf-card"
                    style={{
                      padding: 12,
                      background: "var(--mf-grey-light)",
                      boxShadow: "none",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 900, color: "var(--mf-blue)" }}>
                        {e.message}
                      </div>
                      <div className="mf-muted" style={{ fontSize: 12 }}>
                        {new Date(e.ts).toLocaleString()} • {e.module} • {e.by}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mf-muted">Sin registros aún.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--mf-grey)",
  borderRadius: 10,
  padding: "10px 10px",
  fontSize: 13,
  outline: "none",
  background: "var(--mf-white)",
  color: "var(--mf-text)",
};
