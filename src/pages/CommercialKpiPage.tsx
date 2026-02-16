import React, { useMemo, useState, useEffect } from "react";
import { KpiCard } from "../components/KpiCard";
import DataTable from "../components/DataTable";
import { Tabs } from "../components/Tabs";
import {
  commercialSummaryByMonth,
  claims,
  forecastByCustomer,
  PeriodKey,
  ClaimRow,
  ForecastRow,
} from "../mockData/commercialKpis";
import type { Shipment, DocsStatus, CommercialTargets } from "../types";
import "../styles/mf.css";

type TabKey = "overview" | "claims" | "forecast";

type DeliveredRecord = Shipment & { deliveredAt: string };

type Props = {
  delivered: DeliveredRecord[];
  shipments: Shipment[]; // en seguimiento (por si después quieres KPI extra)
};

const LS_COMM_TARGETS_KEY = "mf.commercial.targets.v1";

function yyyyMmFromIso(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function safeDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isOtif(del: DeliveredRecord) {
  // OTIF MVP:
  // - On-time: deliveredAt <= ETA
  // - Docs OK: docsStatus === "OK"
  const deliveredAt = safeDate(del.deliveredAt);
  const eta = safeDate(del.eta);
  if (!deliveredAt || !eta) return false;
  const onTime = deliveredAt.getTime() <= eta.getTime();
  const docsOk = (del.docsStatus as DocsStatus) === "OK";
  return onTime && docsOk;
}

function deriveSpecie(productText: string): "ATLANTIC" | "COHO" | "OTHER" {
  const t = (productText || "").toLowerCase();
  if (t.includes("coho")) return "COHO";
  if (t.includes("atlantic") || t.includes("salar")) return "ATLANTIC";
  return "OTHER";
}

function loadTargets(): CommercialTargets {
  try {
    const raw = localStorage.getItem(LS_COMM_TARGETS_KEY);
    if (!raw) return { targetsByMonth: {} };
    const parsed = JSON.parse(raw);
    return {
      targetsByMonth: parsed?.targetsByMonth || {},
    };
  } catch {
    return { targetsByMonth: {} };
  }
}

function saveTargets(t: CommercialTargets) {
  try {
    localStorage.setItem(LS_COMM_TARGETS_KEY, JSON.stringify(t));
  } catch {
    // ignore
  }
}

export function CommercialKpiPage(props: Props) {
  const [period, setPeriod] = useState<PeriodKey>("2025-07");
  const [tab, setTab] = useState<TabKey>("overview");

  const [targets, setTargets] = useState<CommercialTargets>(() => loadTargets());

  useEffect(() => {
    saveTargets(targets);
  }, [targets]);

  const summary = commercialSummaryByMonth[period];

  // =========================
  // ✅ Delivered (real data)
  // =========================
  const deliveredInPeriod = useMemo(() => {
    return (props.delivered || []).filter((d) => yyyyMmFromIso(d.deliveredAt) === period);
  }, [props.delivered, period]);

  const kgClosedReal = useMemo(() => {
    return deliveredInPeriod.reduce((acc, d) => acc + Number(d.shippedKg || 0), 0);
  }, [deliveredInPeriod]);

  const ordersClosedReal = useMemo(() => {
    return deliveredInPeriod.length;
  }, [deliveredInPeriod]);

  const otif = useMemo(() => {
    const total = deliveredInPeriod.length;
    if (!total) return { pct: 0, ok: 0, total: 0 };
    const ok = deliveredInPeriod.filter(isOtif).length;
    return { pct: Math.round((ok / total) * 1000) / 10, ok, total }; // 1 decimal
  }, [deliveredInPeriod]);

  // =========================
  // ✅ Targets (editable)
  // =========================
  const periodTargets = targets.targetsByMonth[period] || {};
  const ordersTarget = Number(periodTargets.ordersClosedTarget || 0);
  const kgTarget = Number(periodTargets.kgClosedTarget || 0);
  const otifTargetPct = Number(periodTargets.otifTargetPct || 0);

  const closedVsTargetText = useMemo(() => {
    if (!ordersTarget) return "Meta: —";
    const pct = Math.round((ordersClosedReal / ordersTarget) * 100);
    return `${ordersClosedReal}/${ordersTarget} (${pct}%)`;
  }, [ordersClosedReal, ordersTarget]);

  const kgVsTargetText = useMemo(() => {
    if (!kgTarget) return "Meta kg: —";
    const pct = Math.round((kgClosedReal / kgTarget) * 100);
    return `${kgClosedReal.toLocaleString("es-CL")} / ${kgTarget.toLocaleString("es-CL")} (${pct}%)`;
  }, [kgClosedReal, kgTarget]);

  // =========================
  // ✅ Mix by specie & market
  // =========================
  const mixRows = useMemo(() => {
    const map = new Map<string, { specie: string; market: string; kg: number; orders: number; revenueUsd: number; marginUsd: number | null }>();

    for (const d of deliveredInPeriod) {
      const specie = d.specie || deriveSpecie(d.product);
      const market = d.market || d.country || "OTRO";

      const key = `${specie}__${market}`;
      const prev = map.get(key) || {
        specie,
        market,
        kg: 0,
        orders: 0,
        revenueUsd: 0,
        marginUsd: null as number | null,
      };

      const kg = Number(d.shippedKg || 0);
      prev.kg += kg;
      prev.orders += 1;

      if (typeof d.priceUsdPerKg === "number") {
        prev.revenueUsd += d.priceUsdPerKg * kg;
      }

      if (typeof d.marginUsdPerKg === "number") {
        // acumulamos margen total (USD) si existe
        const add = d.marginUsdPerKg * kg;
        prev.marginUsd = (prev.marginUsd || 0) + add;
      }

      map.set(key, prev);
    }

    const rows = Array.from(map.values());
    rows.sort((a, b) => b.kg - a.kg);
    return rows.map((r) => ({
      ...r,
      sharePct: kgClosedReal ? Math.round((r.kg / kgClosedReal) * 1000) / 10 : 0,
    }));
  }, [deliveredInPeriod, kgClosedReal]);

  // =========================
  // Seed KPI (dummy) kept (price vs market)
  // =========================
  const priceVsMarketText = useMemo(() => {
    const idx = summary.avgPriceVsMarket.index;
    const tag = idx >= 1 ? "vs market ↑" : "vs market ↓";
    return `${summary.avgPriceVsMarket.ourAvg.toFixed(2)} vs ${summary.avgPriceVsMarket.marketAvg.toFixed(2)} (${tag})`;
  }, [summary]);

  // =========================
  // Edit modal
  // =========================
  const [editOpen, setEditOpen] = useState(false);
  const [draftOrdersTarget, setDraftOrdersTarget] = useState<string>("");
  const [draftKgTarget, setDraftKgTarget] = useState<string>("");
  const [draftOtifTarget, setDraftOtifTarget] = useState<string>("");

  function openEditTargets() {
    setDraftOrdersTarget(String(periodTargets.ordersClosedTarget ?? ""));
    setDraftKgTarget(String(periodTargets.kgClosedTarget ?? ""));
    setDraftOtifTarget(String(periodTargets.otifTargetPct ?? ""));
    setEditOpen(true);
  }

  function saveEditTargets() {
    setTargets((prev) => ({
      ...prev,
      targetsByMonth: {
        ...prev.targetsByMonth,
        [period]: {
          ordersClosedTarget: draftOrdersTarget ? Number(draftOrdersTarget) : undefined,
          kgClosedTarget: draftKgTarget ? Number(draftKgTarget) : undefined,
          otifTargetPct: draftOtifTarget ? Number(draftOtifTarget) : undefined,
        },
      },
    }));
    setEditOpen(false);
  }

  function clearTargets() {
    const ok = window.confirm(`¿Eliminar metas para ${period}?`);
    if (!ok) return;
    setTargets((prev) => {
      const next = { ...prev, targetsByMonth: { ...prev.targetsByMonth } };
      delete next.targetsByMonth[period];
      return next;
    });
    setEditOpen(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="mf-chip">
            Periodo:
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              <option value="2025-05">2025-05</option>
              <option value="2025-06">2025-06</option>
              <option value="2025-07">2025-07</option>
            </select>
          </div>

          <Tabs<TabKey>
            value={tab}
            onChange={setTab}
            items={[
              { key: "overview", label: "Overview" },
              { key: "claims", label: "Claims" },
              { key: "forecast", label: "Forecast por Cliente" },
            ]}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="mf-btn mf-btn-secondary" onClick={openEditTargets}>
            Editar Metas
          </button>
          <button className="mf-btn mf-btn-secondary">Exportar CSV</button>
          <button className="mf-btn mf-btn-primary">Crear Reporte</button>
        </div>
      </div>

      {/* KPI Tiles (dummy + connected) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: 12 }}>
        <KpiCard
          title="Órdenes cerradas (real)"
          value={ordersClosedReal.toString()}
          subtitle={closedVsTargetText}
          tag={{ text: "CLOSE", tone: ordersTarget && ordersClosedReal < ordersTarget ? "orange" : "green" }}
        />
        <KpiCard
          title="Kg cerrados (real)"
          value={`${kgClosedReal.toLocaleString("es-CL")} kg`}
          subtitle={kgVsTargetText}
          tag={{ text: "KG", tone: kgTarget && kgClosedReal < kgTarget ? "orange" : "green" }}
        />
        <KpiCard
          title="OTIF (real)"
          value={`${otif.pct.toFixed(1)}%`}
          subtitle={
            otif.total
              ? `${otif.ok}/${otif.total} (meta ${otifTargetPct ? otifTargetPct + "%" : "—"})`
              : "Sin cierres en período"
          }
          tag={{
            text: "OTIF",
            tone: otifTargetPct && otif.pct < otifTargetPct ? "orange" : "green",
          }}
        />
        <KpiCard
          title="Precio Promedio / vs mercado"
          value={summary.avgPriceVsMarket.ourAvg.toFixed(2)}
          subtitle={priceVsMarketText}
          tag={{
            text: summary.avgPriceVsMarket.index >= 1 ? "≥ market" : "< market",
            tone: summary.avgPriceVsMarket.index >= 1 ? "green" : "orange",
          }}
        />
      </div>

      {/* More dummy KPI kept */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(240px, 1fr))", gap: 12 }}>
        <KpiCard
          title="N° Clientes Activos (seed)"
          value={summary.activeCustomers.toString()}
          subtitle="Desde mockData (por ahora)"
          tag={{ text: "KPI", tone: "blue" }}
        />
        <KpiCard
          title="Seguimiento Claims (seed)"
          value={`${summary.claimsOpen} abiertas`}
          subtitle={`${summary.claimsResolved} resueltas`}
          tag={{ text: "CLAIM", tone: summary.claimsOpen > 6 ? "orange" : "blue" }}
        />
        <KpiCard
          title="Forecast / por Cliente (seed)"
          value={`${forecastByCustomer.length} clientes`}
          subtitle="Próximo mes (dummy)"
          tag={{ text: "FCST", tone: "green" }}
        />
      </div>

      {/* Tabs */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="mf-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, color: "var(--mf-blue)" }}>
              Mix por especie / mercado (real)
            </div>

            <div style={{ marginTop: 12 }}>
              <DataTable
                title={undefined}
                data={mixRows}
                getRowId={(r) => `${r.specie}-${r.market}`}
                columns={[
                  { header: "Especie", render: (r) => r.specie },
                  { header: "Mercado", render: (r) => r.market },
                  { header: "Órdenes", render: (r) => r.orders.toLocaleString("es-CL") },
                  { header: "Kg", render: (r) => r.kg.toLocaleString("es-CL") },
                  { header: "% Mix", render: (r) => `${r.sharePct.toFixed(1)}%` },
                  {
                    header: "Revenue (USD)",
                    render: (r) =>
                      r.revenueUsd
                        ? r.revenueUsd.toLocaleString("es-CL", { maximumFractionDigits: 0 })
                        : "—",
                  },
                  {
                    header: "Margen (USD)",
                    render: (r) =>
                      typeof r.marginUsd === "number"
                        ? r.marginUsd.toLocaleString("es-CL", { maximumFractionDigits: 0 })
                        : "—",
                  },
                ]}
              />
            </div>

            <div className="mf-muted" style={{ fontSize: 12, marginTop: 8 }}>
              * Revenue usa priceUsdPerKg si existe en el Shipment. Margen usa marginUsdPerKg si existe.
            </div>
          </div>

          <div className="mf-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, color: "var(--mf-blue)" }}>
              OTIF detalle (MVP)
            </div>

            <div
              style={{
                height: 240,
                marginTop: 12,
                border: "1px dashed var(--mf-grey)",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
                textAlign: "center",
              }}
              className="mf-muted"
            >
              <div>
                OTIF = Entregado ≤ ETA <b>y</b> Docs = OK
              </div>
              <div>
                {otif.total ? (
                  <>
                    Resultado: <b>{otif.ok}</b> OTIF / <b>{otif.total}</b> cerradas
                  </>
                ) : (
                  "Sin entregas cerradas en este período."
                )}
              </div>
              <div style={{ fontSize: 12 }}>
                Próximo paso: “In-Full” real cuando conectemos volúmenes vs contrato/orden.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "claims" && (
        <DataTable<ClaimRow>
          title="Seguimiento Claims"
          actions={<button className="mf-btn mf-btn-primary">Nuevo Claim</button>}
          data={claims}
          getRowId={(r) => r.id}
          columns={[
            { header: "Cliente", render: (r) => r.customer },
            { header: "Mercado", render: (r) => r.market },
            { header: "Producto", render: (r) => r.product },
            { header: "Kg", render: (r) => r.qtyKg.toLocaleString("es-CL") },
            {
              header: "Severidad",
              render: (r) => (
                <span
                  className={`mf-pill ${
                    r.severity === "HIGH"
                      ? "mf-pill-orange"
                      : r.severity === "MED"
                      ? "mf-pill-blue"
                      : "mf-pill-green"
                  }`}
                >
                  {r.severity}
                </span>
              ),
            },
            {
              header: "Estado",
              render: (r) => (
                <span
                  className={`mf-pill ${
                    r.status === "CLOSED"
                      ? "mf-pill-green"
                      : r.status === "INVESTIGATING"
                      ? "mf-pill-blue"
                      : "mf-pill-orange"
                  }`}
                >
                  {r.status}
                </span>
              ),
            },
            {
              header: "Fecha apertura",
              render: (r) => new Date(r.openedDate).toLocaleDateString("es-CL"),
            },
          ]}
        />
      )}

      {tab === "forecast" && (
        <DataTable<ForecastRow>
          title="Forecast por Cliente"
          actions={<button className="mf-btn mf-btn-secondary">Ajustar forecast</button>}
          data={forecastByCustomer}
          getRowId={(r) => r.id}
          columns={[
            { header: "Cliente", render: (r) => r.customer },
            { header: "País", render: (r) => r.country },
            { header: "Mes", render: (r) => r.month },
            { header: "Forecast (kg)", render: (r) => r.forecastKg.toLocaleString("es-CL") },
            { header: "Precio (USD/kg)", render: (r) => r.forecastPrice.toFixed(2) },
            {
              header: "Confianza",
              render: (r) => (
                <span
                  className={`mf-pill ${
                    r.confidence === "HIGH"
                      ? "mf-pill-green"
                      : r.confidence === "MED"
                      ? "mf-pill-blue"
                      : "mf-pill-orange"
                  }`}
                >
                  {r.confidence}
                </span>
              ),
            },
          ]}
        />
      )}

      {/* Modal Metas */}
      {editOpen ? (
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
          onClick={() => setEditOpen(false)}
        >
          <div
            className="mf-card"
            style={{ width: "min(620px, 100%)", padding: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 900, color: "var(--mf-blue)", fontSize: 16 }}>
              Metas Comerciales — {period}
            </div>
            <div className="mf-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Guardadas en localStorage (MVP). Después lo conectamos a backend real.
            </div>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <Field label="Meta Órdenes Cerradas">
                <input
                  value={draftOrdersTarget}
                  onChange={(e) => setDraftOrdersTarget(e.target.value)}
                  style={inputStyle}
                  type="number"
                />
              </Field>

              <Field label="Meta Kg Cerrados">
                <input
                  value={draftKgTarget}
                  onChange={(e) => setDraftKgTarget(e.target.value)}
                  style={inputStyle}
                  type="number"
                  step="1"
                />
              </Field>

              <Field label="Meta OTIF (%)">
                <input
                  value={draftOtifTarget}
                  onChange={(e) => setDraftOtifTarget(e.target.value)}
                  style={inputStyle}
                  type="number"
                  step="0.1"
                />
              </Field>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <button className="mf-btn mf-btn-secondary" onClick={clearTargets}>
                Eliminar metas
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="mf-btn mf-btn-secondary" onClick={() => setEditOpen(false)}>
                  Cancelar
                </button>
                <button className="mf-btn mf-btn-primary" onClick={saveEditTargets}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="mf-muted" style={{ fontSize: 12, fontWeight: 800 }}>
        {props.label}
      </div>
      {props.children}
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
