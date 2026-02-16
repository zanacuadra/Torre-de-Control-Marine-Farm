import React, { useMemo, useState, useEffect } from "react";
import { KpiCard } from "../components/KpiCard";
import DataTable from "../components/DataTable";
import { Tabs } from "../components/Tabs";
import {
  commercialSummaryByMonth,
  claims,
  forecastByCustomer,
  PeriodKey,

  ForecastRow,
} from "../mockData/commercialKpis";
import type { Shipment, DocsStatus, CommercialTargets, ClaimRow, ClaimStatus } from "../types";
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

// Modal de Detalle de Claim
const ClaimDetailModal = ({
  claim,
  onClose,
  onSave,
}: {
  claim: ClaimRow | null;
  onClose: () => void;
  onSave: (updatedClaim: ClaimRow) => void;
}) => {
  const [editedClaim, setEditedClaim] = React.useState<ClaimRow | null>(claim);
  const [showCloseModal, setShowCloseModal] = React.useState(false);
  const [closeReason, setCloseReason] = React.useState("");
  const [creditNote, setCreditNote] = React.useState(false);
  const [creditNoteAmount, setCreditNoteAmount] = React.useState("");

  React.useEffect(() => {
    setEditedClaim(claim);
    setCloseReason(claim?.closeReason || "");
    setCreditNote(claim?.creditNote || false);
    setCreditNoteAmount(claim?.creditNoteAmount?.toString() || "");
  }, [claim]);

  if (!editedClaim) return null;

  const handleStatusChange = (newStatus: ClaimStatus) => {
    if (newStatus === "OK" && editedClaim.status !== "OK") {
      // Abrir modal de cierre
      setShowCloseModal(true);
    } else {
      setEditedClaim({ ...editedClaim, status: newStatus });
    }
  };

  const handleCloseClaim = () => {
    if (!closeReason.trim()) {
      alert("Por favor ingrese la razón de cierre");
      return;
    }
    if (creditNote && (!creditNoteAmount || parseFloat(creditNoteAmount) <= 0)) {
      alert("Por favor ingrese un monto válido para la nota de crédito");
      return;
    }

    const closedClaim: ClaimRow = {
      ...editedClaim,
      status: "OK",
      closeReason: closeReason.trim(),
      creditNote,
      creditNoteAmount: creditNote ? parseFloat(creditNoteAmount) : undefined,
      closedDate: new Date().toISOString().split("T")[0],
    };

    onSave(closedClaim);
    setShowCloseModal(false);
    onClose();
  };

  const handleSave = () => {
    onSave(editedClaim);
    onClose();
  };

  const statusOptions: ClaimStatus[] = ["PENDIENTE ENVÍO", "PENDIENTE RESPUESTA", "OK"];

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="mf-card"
          style={{
            maxWidth: 700,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            padding: 24,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="mf-h1">Detalle del Claim</div>
            <button
              className="mf-btn mf-btn-secondary"
              onClick={onClose}
              style={{ padding: "6px 12px" }}
            >
              ✕
            </button>
          </div>

          {/* Información del Claim */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ID y Cliente */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  ID Claim
                </label>
                <div style={{ fontWeight: 600 }}>{editedClaim.id}</div>
              </div>
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Cliente
                </label>
                <div style={{ fontWeight: 600 }}>{editedClaim.customer}</div>
              </div>
            </div>

            {/* Producto y Mercado */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Producto
                </label>
                <div>{editedClaim.product}</div>
              </div>
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Mercado
                </label>
                <div>{editedClaim.market}</div>
              </div>
            </div>

            {/* Glosa/Descripción */}
            <div>
              <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Descripción del Claim
              </label>
              <textarea
                value={editedClaim.description || ""}
                onChange={(e) => setEditedClaim({ ...editedClaim, description: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
                placeholder="Descripción detallada del claim..."
              />
            </div>

            {/* Fecha Recibo y Responsable */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Fecha de Recibo
                </label>
                <input
                  type="date"
                  value={editedClaim.receivedDate || ""}
                  onChange={(e) => setEditedClaim({ ...editedClaim, receivedDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Responsable de Responder
                </label>
                <input
                  type="text"
                  value={editedClaim.responsiblePerson || ""}
                  onChange={(e) => setEditedClaim({ ...editedClaim, responsiblePerson: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 14,
                  }}
                  placeholder="Nombre del responsable"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Estado
              </label>
              <select
                value={editedClaim.status}
                onChange={(e) => handleStatusChange(e.target.value as ClaimStatus)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Si ya está cerrado, mostrar información de cierre */}
            {editedClaim.status === "OK" && editedClaim.closeReason && (
              <div
                style={{
                  background: "#f0f9ff",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #bfdbfe",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, color: "#1e40af" }}>
                  Información de Cierre
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div className="mf-muted" style={{ fontSize: 12 }}>Razón de Cierre:</div>
                  <div>{editedClaim.closeReason}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="mf-muted" style={{ fontSize: 12 }}>Nota de Crédito:</div>
                    <div>{editedClaim.creditNote ? "SÍ" : "NO"}</div>
                  </div>
                  {editedClaim.creditNote && editedClaim.creditNoteAmount && (
                    <div>
                      <div className="mf-muted" style={{ fontSize: 12 }}>Monto:</div>
                      <div style={{ fontWeight: 600 }}>
                        USD ${editedClaim.creditNoteAmount.toLocaleString("es-CL")}
                      </div>
                    </div>
                  )}
                </div>
                {editedClaim.closedDate && (
                  <div style={{ marginTop: 8 }}>
                    <div className="mf-muted" style={{ fontSize: 12 }}>Fecha de Cierre:</div>
                    <div>{new Date(editedClaim.closedDate).toLocaleDateString("es-CL")}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button className="mf-btn mf-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="mf-btn mf-btn-primary" onClick={handleSave}>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cierre de Claim */}
      {showCloseModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowCloseModal(false)}
        >
          <div
            className="mf-card"
            style={{
              maxWidth: 500,
              width: "100%",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mf-h1" style={{ marginBottom: 20 }}>
              Cerrar Claim
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Razón de Cierre */}
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Razón de Cierre *
                </label>
                <textarea
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 100,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  placeholder="Explique la razón del cierre del claim..."
                />
              </div>

              {/* Nota de Crédito */}
              <div>
                <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Nota de Crédito
                </label>
                <select
                  value={creditNote ? "SI" : "NO"}
                  onChange={(e) => {
                    setCreditNote(e.target.value === "SI");
                    if (e.target.value === "NO") {
                      setCreditNoteAmount("");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 14,
                    background: "#fff",
                  }}
                >
                  <option value="NO">NO</option>
                  <option value="SI">SÍ</option>
                </select>
              </div>

              {/* Monto de Nota de Crédito */}
              {creditNote && (
                <div>
                  <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    Monto de Nota de Crédito (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={creditNoteAmount}
                    onChange={(e) => setCreditNoteAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: 14,
                    }}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => setShowCloseModal(false)}
              >
                Cancelar
              </button>
              <button
                className="mf-btn mf-btn-primary"
                onClick={handleCloseClaim}
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export function CommercialKpiPage(props: Props) {
  const [period, setPeriod] = useState<PeriodKey>("2025-07");
  const [tab, setTab] = useState<TabKey>("overview");
  const [claimsData, setClaimsData] = React.useState<ClaimRow[]>(claims);
  const [selectedClaim, setSelectedClaim] = React.useState<ClaimRow | null>(null);

  const [targets, setTargets] = useState<CommercialTargets>(() => loadTargets());

  useEffect(() => {
    saveTargets(targets);
  }, [targets]);

  const summary = commercialSummaryByMonth[period];

  const handleSaveClaim = (updatedClaim: ClaimRow) => {
    setClaimsData((prev) =>
      prev.map((c) => (c.id === updatedClaim.id ? updatedClaim : c))
    );
  };

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
          data={claimsData}
          onRowClick={(claim) => setSelectedClaim(claim)}
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
                    r.status === "OK"
                      ? "mf-pill-green"
                      : r.status === "PENDIENTE RESPUESTA"
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
