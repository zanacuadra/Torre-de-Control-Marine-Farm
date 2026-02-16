import React, { useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../components/DataTable";
import type {
  BacklogOrder,
  Shipment,
  DelayReasonCode,
  DelayOwner,
} from "../types";
import type { CalculatorContext } from "./CalculatorPage";

const LS_ORDERS_KEY = "mf.orders.v1";

type Props = {
  orders: BacklogOrder[];
  setOrders: React.Dispatch<React.SetStateAction<BacklogOrder[]>>;
  openCalculator: (ctx: CalculatorContext) => void;
  moveOrderToTransit: (orderId: string, shipment: Shipment) => void;
  goToRequests: () => void;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function etdTrafficLight(etdIso?: string): "red" | "yellow" | "green" {
  if (!etdIso) return "green";
  const today = startOfToday();
  const etd = new Date(etdIso);
  if (Number.isNaN(etd.getTime())) return "green";
  etd.setHours(0, 0, 0, 0);

  const diff = daysBetween(today, etd);
  if (diff < 0) return "red";
  if (diff <= 14) return "yellow";
  return "green";
}

function isShippingOk(consignee?: string, notify?: string) {
  return Boolean((consignee || "").trim()) && Boolean((notify || "").trim());
}

function deriveSpecie(productText: string): "ATLANTIC" | "COHO" | "OTHER" {
  const t = (productText || "").toLowerCase();
  if (t.includes("coho")) return "COHO";
  if (t.includes("atlantic") || t.includes("salar")) return "ATLANTIC";
  return "OTHER";
}

const DELAY_REASONS: { code: DelayReasonCode; label: string }[] = [
  { code: "QC", label: "Retenido por Calidad" },
  { code: "RM", label: "Falta Materia Prima" },
  { code: "COM", label: "Aprobación Inspección Cliente" },
  { code: "BLOQ", label: "Stock Bloqueado" },
  { code: "PROD", label: "Reempaque (Producción)" },
];

const DEFAULT_OWNER_BY_REASON: Record<DelayReasonCode, DelayOwner> = {
  QC: "QA / Calidad",
  RM: "Planning / Abastecimiento",
  COM: "Comercial / Key Account",
  BLOQ: "Bodega / Inventarios",
  PROD: "Producción / Planta",
};

const OWNER_OPTIONS: DelayOwner[] = [
  "QA / Calidad",
  "Planning / Abastecimiento",
  "Comercial / Key Account",
  "Bodega / Inventarios",
  "Producción / Planta",
];

function makeShipmentFromOrder(o: BacklogOrder): Shipment {
  const now = new Date();
  const eta = new Date(now.getTime() + 25 * 24 * 3600 * 1000);

  return {
    id: `SHP-${o.id}`,
    orderId: o.id,
    pi: o.pi,

    customer: o.customer,
    country: o.country,
    destination: o.destination,
    product: o.product,

    booking: "BK-000",
    etd: o.etd,
    eta: eta.toISOString().slice(0, 10),

    docsStatus: "PEND",
    shippedKg: o.pendingKg,

    // ✅ Comercial
    specie: deriveSpecie(o.product),
    market: o.country,
    priceUsdPerKg: o.priceUsdPerKg,
  };
}

export default function OrdersPage(props: Props) {
  const {
    orders,
    setOrders,
    openCalculator,
    moveOrderToTransit,
    goToRequests,
  } = props;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ✅ helper para evitar que el click colapse/expanda la fila al editar inputs
  function stop(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ORDERS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const valid = parsed.every((x: any) => typeof x?.id === "string");
      if (!valid) return;
      setOrders(parsed as BacklogOrder[]);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function normalizePriorities(list: BacklogOrder[]): BacklogOrder[] {
    const sorted = [...list].sort((a, b) => a.priority - b.priority);
    return sorted.map((o, idx) => ({ ...o, priority: idx + 1 }));
  }

  function moveToPriority(orderId: string, targetPriority: number) {
    setOrders((prev) => {
      const current = [...prev];
      const idx = current.findIndex((o) => o.id === orderId);
      if (idx < 0) return prev;

      const normalized = normalizePriorities(current);
      const item = normalized.find((o) => o.id === orderId);
      if (!item) return prev;

      const n = normalized.length;
      const tp = Math.max(1, Math.min(n, targetPriority));

      const without = normalized.filter((o) => o.id !== orderId);
      without.splice(tp - 1, 0, item);

      return without.map((o, i) => ({ ...o, priority: i + 1 }));
    });
  }

  function updateShippingFields(
    orderId: string,
    patch: { shippingConsignee?: string; shippingNotify?: string }
  ) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = { ...o, ...patch };
        return {
          ...next,
          shippingInstructionsOk: isShippingOk(
            next.shippingConsignee,
            next.shippingNotify
          ),
        };
      })
    );
  }

  function updateDelayFields(
    orderId: string,
    patch: {
      delayReasonCode?: DelayReasonCode;
      delayOwner?: DelayOwner;
      delayComment?: string;
    }
  ) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        const nextReason = patch.delayReasonCode ?? o.delayReasonCode;
        let nextOwner = patch.delayOwner ?? o.delayOwner;

        // ✅ sugerencia owner al elegir razón (solo si no viene owner explícito)
        if (patch.delayReasonCode && !patch.delayOwner) {
          nextOwner = DEFAULT_OWNER_BY_REASON[patch.delayReasonCode];
        }

        const nextComment =
          typeof patch.delayComment === "string"
            ? patch.delayComment.slice(0, 120)
            : o.delayComment;

        return {
          ...o,
          delayReasonCode: nextReason,
          delayOwner: nextOwner,
          delayComment: nextComment,
        };
      })
    );
  }

  function canDispatch(order: BacklogOrder) {
    const t = etdTrafficLight(order.etd);
    if (t !== "red") return true;
    return Boolean(order.delayReasonCode) && Boolean(order.delayOwner);
  }

  function sendToTransit(order: BacklogOrder) {
    if (!canDispatch(order)) {
      alert(
        "Orden atrasada: debes completar Razón de atraso y Responsable antes de despachar."
      );
      return;
    }
    const shipment = makeShipmentFromOrder(order);
    moveOrderToTransit(order.id, shipment);
  }

  const columns: Column<BacklogOrder>[] = useMemo(
    () => [
      {
        header: "Semáforo",
        render: (r) => {
          const t = etdTrafficLight(r.etd);
          const cls =
            t === "red"
              ? "mf-pill mf-pill-red"
              : t === "yellow"
              ? "mf-pill mf-pill-yellow"
              : "mf-pill mf-pill-green";
          return (
            <span className={cls}>
              {t === "red" ? "ATRASO" : t === "yellow" ? "ALERTA" : "OK"}
            </span>
          );
        },
      },
      { header: "PI", render: (r) => <b>{r.pi}</b> },
      { header: "Cliente", render: (r) => r.customer },
      { header: "País", render: (r) => r.country },
      { header: "Destino", render: (r) => r.destination },
      { header: "Producto", render: (r) => r.product },
      { header: "Kg", render: (r) => r.pendingKg.toLocaleString("es-CL") },
      {
        header: "Prioridad",
        render: (r) => (
          <span className="mf-pill mf-pill-orange">{`P${r.priority}`}</span>
        ),
      },
      {
        header: "Shipping Instr.",
        render: (r) => (
          <span
            className={`mf-pill ${
              r.shippingInstructionsOk ? "mf-pill-green" : "mf-pill-yellow"
            }`}
            title="Consignee y Notify"
          >
            {r.shippingInstructionsOk ? "OK" : "PENDIENTE"}
          </span>
        ),
      },
      { header: "ETD", render: (r) => r.etd },
    ],
    []
  );

  const actions = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="mf-btn mf-btn-secondary" onClick={goToRequests}>
        Ver Solicitudes
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DataTable
        title="Pedidos Pendientes / Prioridades"
        actions={actions}
        data={orders}
        columns={columns}
        getRowId={(r) => r.id}
        expandedRowId={expandedId || undefined}
        onRowClick={(row) => toggleExpand(row.id)}
        renderExpandedRow={(expanded) => {
          const light = etdTrafficLight(expanded.etd);
          const isRed = light === "red";

          const needsDelayBlock =
            isRed && (!expanded.delayReasonCode || !expanded.delayOwner);

          const dispatchDisabled = !canDispatch(expanded);

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Acciones */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={(e) => {
                    stop(e);
                    moveToPriority(expanded.id, expanded.priority - 1);
                  }}
                >
                  +1 prioridad
                </button>

                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={(e) => {
                    stop(e);
                    moveToPriority(expanded.id, expanded.priority + 1);
                  }}
                >
                  -1 prioridad
                </button>

                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={(e) => {
                    stop(e);
                    moveToPriority(expanded.id, 1);
                  }}
                >
                  A P1
                </button>

                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={(e) => {
                    stop(e);
                    moveToPriority(expanded.id, orders.length);
                  }}
                >
                  Última
                </button>

                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={(e) => {
                    stop(e);
                    openCalculator({
                      specie: expanded.product.toLowerCase().includes("coho")
                        ? "coho"
                        : "atlantic",
                      country: expanded.country,
                      format: expanded.product,
                      priceRef: expanded.priceUsdPerKg,
                    } as unknown as CalculatorContext);
                  }}
                >
                  Ver Precio (Calculadora)
                </button>

                <button
                  className={`mf-btn ${
                    dispatchDisabled ? "mf-btn-secondary" : "mf-btn-primary"
                  }`}
                  disabled={dispatchDisabled}
                  style={
                    dispatchDisabled
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : undefined
                  }
                  onClick={(e) => {
                    stop(e);
                    sendToTransit(expanded);
                  }}
                  title={
                    dispatchDisabled
                      ? "Orden atrasada: completa Razón de atraso y Responsable antes de despachar."
                      : "Marcar como despachado y pasar a Tránsito"
                  }
                >
                  Despachado
                </button>
              </div>

              {/* Bloque Atraso (solo si rojo y falta info) */}
              {needsDelayBlock ? (
                <div
                  className="mf-card"
                  style={{
                    padding: 12,
                    background: "rgba(255, 59, 48, 0.06)",
                    border: "1px solid rgba(255, 59, 48, 0.25)",
                    boxShadow: "none",
                  }}
                  onClick={stop}
                  onMouseDown={stop}
                >
                  <div
                    style={{
                      fontWeight: 900,
                      color: "var(--mf-blue)",
                      marginBottom: 6,
                    }}
                  >
                    Atraso – completar para seguimiento
                  </div>
                  <div
                    className="mf-muted"
                    style={{ fontSize: 12, marginBottom: 10 }}
                  >
                    Esta orden está atrasada (ETD &lt; hoy). Debes asignar Razón
                    y Responsable antes de poder despachar.
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <Field label="Razón de atraso (obligatoria)">
                      <select
                        value={expanded.delayReasonCode || ""}
                        onChange={(e) =>
                          updateDelayFields(expanded.id, {
                            delayReasonCode: e.target.value as DelayReasonCode,
                          })
                        }
                        onClick={stop}
                        onMouseDown={stop}
                        style={inputStyle}
                      >
                        <option value="">Seleccionar…</option>
                        {DELAY_REASONS.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.code} — {r.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Responsable liberación / seguimiento (obligatorio)">
                      <select
                        value={expanded.delayOwner || ""}
                        onChange={(e) =>
                          updateDelayFields(expanded.id, {
                            delayOwner: e.target.value as DelayOwner,
                          })
                        }
                        onClick={stop}
                        onMouseDown={stop}
                        style={inputStyle}
                      >
                        <option value="">Seleccionar…</option>
                        {OWNER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Comentario corto (opcional, máx 120)">
                      <input
                        value={expanded.delayComment || ""}
                        onChange={(e) =>
                          updateDelayFields(expanded.id, {
                            delayComment: e.target.value,
                          })
                        }
                        onClick={stop}
                        onMouseDown={stop}
                        style={inputStyle}
                        placeholder="Contexto breve…"
                        maxLength={120}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {/* Detalle KV */}
              <div className="mf-kv" onClick={stop} onMouseDown={stop}>
                <div className="k">Producto</div>
                <div className="v">{expanded.product}</div>

                <div className="k">Planta</div>
                <div className="v">{expanded.plant}</div>

                <div className="k">Comercial</div>
                <div className="v">{expanded.commercial}</div>

                <div className="k">Shipping Instr.</div>
                <div className="v">
                  <span
                    className={`mf-pill ${
                      expanded.shippingInstructionsOk
                        ? "mf-pill-green"
                        : "mf-pill-yellow"
                    }`}
                  >
                    {expanded.shippingInstructionsOk ? "OK" : "PENDIENTE"}
                  </span>
                </div>

                <div className="k">Consignee</div>
                <div className="v">
                  <input
                    value={expanded.shippingConsignee || ""}
                    onChange={(e) =>
                      updateShippingFields(expanded.id, {
                        shippingConsignee: e.target.value,
                      })
                    }
                    onClick={stop}
                    onMouseDown={stop}
                    style={inputStyle}
                    placeholder="Consignee"
                  />
                </div>

                <div className="k">Notify</div>
                <div className="v">
                  <input
                    value={expanded.shippingNotify || ""}
                    onChange={(e) =>
                      updateShippingFields(expanded.id, {
                        shippingNotify: e.target.value,
                      })
                    }
                    onClick={stop}
                    onMouseDown={stop}
                    style={inputStyle}
                    placeholder="Notify"
                  />
                </div>

                {isRed && expanded.delayReasonCode && expanded.delayOwner ? (
                  <>
                    <div className="k">Atraso</div>
                    <div className="v">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span
                          className="mf-pill mf-pill-red"
                          style={{ width: "fit-content" }}
                        >
                          {expanded.delayReasonCode}
                        </span>
                        <div className="mf-muted" style={{ fontSize: 12 }}>
                          {DELAY_REASONS.find(
                            (x) => x.code === expanded.delayReasonCode
                          )?.label || ""}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800 }}>
                          {expanded.delayOwner}
                        </div>
                        {expanded.delayComment ? (
                          <div className="mf-muted" style={{ fontSize: 12 }}>
                            {expanded.delayComment}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          );
        }}
      />
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
