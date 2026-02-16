import React, { useMemo } from "react";
import "../styles/mf.css";
import type { PageKey } from "../App";
import type { BacklogOrder, Shipment } from "../types";

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

function fmtInt(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function etaBucket(etaIso?: string) {
  if (!etaIso) return "SIN ETA";
  const today = startOfToday();
  const eta = new Date(etaIso);
  if (Number.isNaN(eta.getTime())) return "SIN ETA";
  eta.setHours(0, 0, 0, 0);

  const diff = daysBetween(today, eta);
  if (diff < 0) return "VENCIDA";
  if (diff <= 7) return "0–7D";
  if (diff <= 14) return "8–14D";
  if (diff <= 30) return "15–30D";
  return "30+D";
}

export default function DashboardPage(props: {
  goTo: (p: PageKey) => void;

  orders: BacklogOrder[];
  shipments: Shipment[];

  etaToday: Shipment[];
  onConfirmDelivered: (shipmentId: string) => void;

  // ✅ KPI Comercial
  closedThisMonth: number;
}) {
  const etaToday = props.etaToday || [];

  const kpiPendingKg = useMemo(() => {
    return (props.orders || []).reduce(
      (acc, o) => acc + Number(o.pendingKg || 0),
      0
    );
  }, [props.orders]);

  const kpiTransitOrders = useMemo(() => {
    // “en seguimiento” = ETA futura o docs != OK
    const list = props.shipments || [];
    return list.filter((s) => {
      const d = etaDays(s.eta);
      const notArrived = typeof d === "number" ? d > 0 : true;
      const docsNotOk = String(s.docsStatus || "PEND") !== "OK";
      return notArrived || docsNotOk;
    }).length;
  }, [props.shipments]);

  /* =======================
     ✅ “TV MODE” charts data
  ======================= */

  // Chart 1: Pending Kg by Priority (Top 8)
  const chartPriority = useMemo(() => {
    const rows = [...(props.orders || [])]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 8)
      .map((o) => ({
        label: `P${o.priority} • ${o.customer}`,
        value: Number(o.pendingKg || 0),
      }));

    const max = Math.max(1, ...rows.map((r) => r.value));
    return { rows, max };
  }, [props.orders]);

  // Chart 2: Shipments by DocsStatus
  const chartDocs = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of props.shipments || []) {
      const k = String(s.docsStatus || "PEND");
      map[k] = (map[k] || 0) + 1;
    }
    const rows = Object.entries(map)
      .map(([k, v]) => ({ label: k, value: v }))
      .sort((a, b) => b.value - a.value);

    const max = Math.max(1, ...rows.map((r) => r.value));
    return { rows, max };
  }, [props.shipments]);

  // Chart 3: ETA Risk buckets
  const chartEta = useMemo(() => {
    const buckets: Record<string, number> = {
      VENCIDA: 0,
      "0–7D": 0,
      "8–14D": 0,
      "15–30D": 0,
      "30+D": 0,
      "SIN ETA": 0,
    };

    for (const s of props.shipments || []) {
      const b = etaBucket(s.eta);
      buckets[b] = (buckets[b] || 0) + 1;
    }

    const rows = Object.entries(buckets).map(([label, value]) => ({
      label,
      value,
    }));
    const max = Math.max(1, ...rows.map((r) => r.value));
    return { rows, max };
  }, [props.shipments]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Notificación ETA hoy */}
      {etaToday.length > 0 ? (
        <div
          className="mf-card"
          style={{ padding: 16, borderLeft: "6px solid var(--mf-orange)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
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
                ⚠️ Llegadas hoy (ETA)
              </div>
              <div className="mf-muted" style={{ marginTop: 6, fontSize: 13 }}>
                Confirma que todo está OK para cerrar la orden en destino.
              </div>
            </div>

            <button
              className="mf-btn mf-btn-secondary"
              onClick={() => props.goTo("shipments")}
            >
              Ir a Tránsito
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {etaToday.map((s) => (
              <div
                key={String(s.id)}
                className="mf-card"
                style={{
                  padding: 12,
                  background: "var(--mf-grey-light)",
                  boxShadow: "none",
                  border: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 900, color: "var(--mf-blue)" }}>
                    {s.customer || "Cliente"} •{" "}
                    {String((s as any).pi || s.orderId || "PI")}
                  </div>
                  <div className="mf-muted" style={{ fontSize: 12 }}>
                    {s.destination || "Destino"} • ETA hoy
                  </div>
                </div>

                <button
                  className="mf-btn mf-btn-primary"
                  onClick={() => props.onConfirmDelivered(String(s.id))}
                  title="Confirmar entregado en destino"
                >
                  Confirmar OK
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Header (con Logo + título grande) */}
      <div className="mf-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/logo-blue.png"
            alt="Logo"
            style={{ height: 34, width: "auto" }}
          />
          <div
            style={{ fontWeight: 900, color: "var(--mf-blue)", fontSize: 26 }}
          >
            Dashboard
          </div>
        </div>

        <div className="mf-muted" style={{ marginTop: 6, fontSize: 13 }}>
          Control Comercial Asia • Órdenes • Tránsito • KPI Comerciales
        </div>
      </div>

      {/* KPI Tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <Tile
          title="Pedidos"
          subtitle="Pendientes / Prioridades"
          value={`${kpiPendingKg.toLocaleString("es-CL")} kg`}
          footnote={`${(props.orders || []).length} órdenes`}
          onClick={() => props.goTo("orders")}
        />

        <Tile
          title="Tránsito"
          subtitle="ETD-ETA / Status Docs"
          value={`${kpiTransitOrders.toLocaleString("es-CL")}`}
          footnote="órdenes en seguimiento"
          onClick={() => props.goTo("shipments")}
        />

        <Tile
          title="Comercial"
          subtitle="KPI Comerciales"
          value={`${Number(props.closedThisMonth || 0).toLocaleString(
            "es-CL"
          )}`}
          footnote="Órdenes cerradas (mes)"
          onClick={() => props.goTo("commercialKpi")}
        />
      </div>

      {/* ✅ TV MODE: 3 gráficos (sin librerías) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 12,
        }}
      >
        <ChartCard title="Top Prioridades (Kg Pendientes)">
          {chartPriority.rows.length ? (
            <BarList
              rows={chartPriority.rows}
              max={chartPriority.max}
              valueFmt={(v) => `${fmtInt(v)} kg`}
            />
          ) : (
            <div className="mf-muted">Sin datos</div>
          )}
        </ChartCard>

        <ChartCard title="Tránsito por Documentación">
          {chartDocs.rows.length ? (
            <BarList
              rows={chartDocs.rows}
              max={chartDocs.max}
              valueFmt={(v) => `${fmtInt(v)}`}
            />
          ) : (
            <div className="mf-muted">Sin datos</div>
          )}
        </ChartCard>

        <ChartCard title="Riesgo Logístico por ETA (Buckets)">
          {chartEta.rows.length ? (
            <BarList
              rows={chartEta.rows}
              max={chartEta.max}
              valueFmt={(v) => `${fmtInt(v)}`}
            />
          ) : (
            <div className="mf-muted">Sin datos</div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function Tile(props: {
  title: string;
  subtitle: string;
  value: string;
  footnote?: string;
  onClick: () => void;
}) {
  return (
    <div
      className="mf-card"
      style={{ padding: 16, cursor: "pointer" }}
      onClick={props.onClick}
    >
      <div style={{ fontWeight: 900, color: "var(--mf-blue)" }}>
        {props.title}
      </div>
      <div className="mf-muted" style={{ marginTop: 6, fontSize: 12 }}>
        {props.subtitle}
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 22,
          fontWeight: 900,
          color: "var(--mf-blue)",
        }}
      >
        {props.value}
      </div>

      {props.footnote ? (
        <div className="mf-muted" style={{ marginTop: 6, fontSize: 12 }}>
          {props.footnote}
        </div>
      ) : null}
    </div>
  );
}

/* =======================
   TV MODE simple components
======================= */

function ChartCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="mf-card" style={{ padding: 16 }}>
      <div
        style={{
          fontWeight: 900,
          color: "var(--mf-blue)",
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

function BarList(props: {
  rows: { label: string; value: number }[];
  max: number;
  valueFmt: (v: number) => string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {props.rows.map((r, idx) => {
        const pct = Math.max(0, Math.min(1, r.value / (props.max || 1)));
        return (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 110px",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                {r.label}
              </div>
              <div
                style={{
                  height: 10,
                  background: "rgba(0,0,0,0.08)",
                  borderRadius: 999,
                }}
              >
                <div
                  style={{
                    height: 10,
                    width: `${pct * 100}%`,
                    background: "var(--mf-blue)",
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: "right", fontWeight: 900 }}>
              {props.valueFmt(r.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
