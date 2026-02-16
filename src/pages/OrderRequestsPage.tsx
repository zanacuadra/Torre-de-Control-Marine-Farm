import React, { useMemo, useState } from "react";
import "../styles/mf.css";
import type { OrderRequest, OrderRequestItem, AuditEntry } from "../types";

const DEFAULT_ITEM_VOLUME_KG = 20000;

function nowIso() {
  return new Date().toISOString();
}

function fmt(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function toMonthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map((x) => parseInt(x, 10));
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${months[(m || 1) - 1]} ${y}`;
}

function sumVolumeKg(items: OrderRequestItem[]) {
  return items.reduce((a, it) => a + (it.volume?.value || 0), 0);
}

function priceToUsdPerKg(value: number, uom: "kg" | "lb") {
  if (uom === "kg") return value;
  return value * 2.20462262;
}

function weightedAvgPriceUsdKg(items: OrderRequestItem[]) {
  const totalKg = sumVolumeKg(items);
  if (!totalKg) return 0;
  let acc = 0;
  for (const it of items) {
    const pKg = priceToUsdPerKg(it.price.value, it.price.uom);
    acc += pKg * it.volume.value;
  }
  return acc / totalKg;
}

function requestRowTitle(req: OrderRequest) {
  return `${req.client} • ${req.incoterm} ${
    req.destination
  } • ETD ${toMonthLabel(req.shipmentEtdMonth)}`;
}

function deriveShippingStatus(
  consignee?: string,
  notify?: string
): "OK" | "PENDIENTE" {
  const ok =
    Boolean((consignee || "").trim()) && Boolean((notify || "").trim());
  return ok ? "OK" : "PENDIENTE";
}

function pushAudit(
  prev: AuditEntry[] | undefined,
  entry: AuditEntry
): AuditEntry[] {
  return [...(prev || []), entry];
}

function newItem(): OrderRequestItem {
  return {
    id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    product: "",
    quality: "Premium",
    size: "",
    price: { value: 0, uom: "kg" },
    volume: { value: DEFAULT_ITEM_VOLUME_KG, uom: "kg" },
  };
}

function newRequestId() {
  return `REQ-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

function newRequestTemplate(requester: string): OrderRequest {
  const createdAt = nowIso();
  const base: OrderRequest = {
    id: newRequestId(),
    requester,
    status: "BORRADOR",
    createdAt,
    updatedAt: createdAt,

    client: "",
    consignee: "",
    notify: "",

    incoterm: "CFR",
    destination: "",
    shipmentEtdMonth: "2025-10",

    paymentMethod: "Payment Against Docs.",

    certifications: ["N/A"],
    inspection: true,

    shippingInstructionsStatus: "PENDIENTE",

    additionalLabel: "NO",
    additionalRequirements: "",

    items: [newItem()],
    comments: "",

    auditLog: [
      {
        ts: createdAt,
        module: "REQUESTS",
        by: requester,
        message: "Solicitud creada (BORRADOR).",
      },
    ],
  };

  return base;
}

function duplicateAsDraft(source: OrderRequest): OrderRequest {
  const copiedItems: OrderRequestItem[] = (source.items || []).map((it) => ({
    ...it,
    id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  }));

  const createdAt = nowIso();
  const draft: OrderRequest = {
    ...source,
    id: newRequestId(),
    createdAt,
    updatedAt: createdAt,
    status: "BORRADOR",
    pi: undefined,
    erp: undefined,
    items: copiedItems.length ? copiedItems : [newItem()],
  };

  return {
    ...draft,
    shippingInstructionsStatus: deriveShippingStatus(
      draft.consignee,
      draft.notify
    ),
    auditLog: pushAudit(draft.auditLog, {
      ts: createdAt,
      module: "REQUESTS",
      by: draft.requester,
      message: `Duplicada desde ${source.id} → nueva Solicitud (BORRADOR).`,
    }),
  };
}

export default function OrderRequestsPage(props: {
  requests: OrderRequest[];
  setRequests: React.Dispatch<React.SetStateAction<OrderRequest[]>>;
  createBacklogOrderFromRequest: (req: OrderRequest) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<OrderRequest>(() =>
    newRequestTemplate("NICOLAS CUADRA")
  );

  // modal PI
  const [piModalOpen, setPiModalOpen] = useState(false);
  const [piTargetId, setPiTargetId] = useState<string | null>(null);
  const [piValue, setPiValue] = useState("");
  const [piError, setPiError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return props.requests
      .slice()
      .sort((a, b) =>
        String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
      );
  }, [props.requests]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function removeRequest(id: string) {
    props.setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  function deleteRequest(id: string) {
    const ok = window.confirm(
      "¿Eliminar esta solicitud? Esta acción no se puede deshacer."
    );
    if (!ok) return;
    removeRequest(id);
    if (expandedId === id) setExpandedId(null);
  }

  function updateRequest(
    id: string,
    patch: Partial<OrderRequest>,
    auditMessage?: string
  ) {
    props.setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const next: OrderRequest = {
          ...r,
          ...patch,
          updatedAt: nowIso(),
          shippingInstructionsStatus: deriveShippingStatus(
            patch.consignee ?? r.consignee,
            patch.notify ?? r.notify
          ),
        };

        if (auditMessage) {
          next.auditLog = pushAudit(next.auditLog, {
            ts: nowIso(),
            module: "REQUESTS",
            by: next.requester || "USER",
            message: auditMessage,
          });
        }

        return next;
      })
    );
  }

  function openAssignPi(req: OrderRequest) {
    setPiError(null);
    setPiValue(req.pi || "");
    setPiTargetId(req.id);
    setPiModalOpen(true);
  }

  function validatePi(input: string) {
    const v = (input || "").trim();
    const ok = /^[A-Za-z0-9]{4,10}(-[A-Za-z0-9]{4,10})?$/.test(v);
    if (!v) return "PI requerida.";
    if (!ok) return "Formato inválido. Usa XXXXX o XXXX-XXXXX.";
    return null;
  }

  function confirmAssignPi() {
    const err = validatePi(piValue);
    if (err) {
      setPiError(err);
      return;
    }
    if (!piTargetId) return;

    const target = props.requests.find((r) => r.id === piTargetId);
    if (!target) {
      setPiModalOpen(false);
      return;
    }

    const cleaned: OrderRequest = {
      ...target,
      pi: piValue.trim(),
      status: "PI CREADA",
      updatedAt: nowIso(),
      shippingInstructionsStatus: deriveShippingStatus(
        target.consignee,
        target.notify
      ),
      auditLog: pushAudit(target.auditLog, {
        ts: nowIso(),
        module: "REQUESTS",
        by: "Sales Support",
        message: `PI asignada: ${piValue.trim()}. Solicitud convertida a Pedido.`,
      }),
    };

    // sale de solicitudes
    removeRequest(target.id);

    // entra a pedidos
    props.createBacklogOrderFromRequest(cleaned);

    setPiModalOpen(false);
    setExpandedId(null);
    setPiTargetId(null);
    setPiValue("");
    setPiError(null);
  }

  function updateDraft(patch: Partial<OrderRequest>, auditMessage?: string) {
    setDraft((prev) => {
      const next: OrderRequest = {
        ...prev,
        ...patch,
        updatedAt: nowIso(),
        shippingInstructionsStatus: deriveShippingStatus(
          patch.consignee ?? prev.consignee,
          patch.notify ?? prev.notify
        ),
      };

      if (auditMessage) {
        next.auditLog = pushAudit(next.auditLog, {
          ts: nowIso(),
          module: "REQUESTS",
          by: next.requester,
          message: auditMessage,
        });
      }

      return next;
    });
  }

  function addDraftLine() {
    updateDraft(
      { items: [...draft.items, newItem()] },
      "Se agregó una línea de ítem."
    );
  }

  function removeDraftLine(lineId: string) {
    updateDraft(
      { items: draft.items.filter((x) => x.id !== lineId) },
      "Se eliminó una línea de ítem."
    );
  }

  function updateDraftLine(lineId: string, patch: Partial<OrderRequestItem>) {
    setDraft((prev) => ({
      ...prev,
      updatedAt: nowIso(),
      items: prev.items.map((it) =>
        it.id === lineId ? { ...it, ...patch } : it
      ),
    }));
  }

  function saveToInbox(req: OrderRequest, status: "ENVIADA" | "BORRADOR") {
    const clean: OrderRequest = {
      ...req,
      status,
      createdAt: req.createdAt || nowIso(),
      updatedAt: nowIso(),
      shippingInstructionsStatus: deriveShippingStatus(
        req.consignee,
        req.notify
      ),
      auditLog: pushAudit(req.auditLog, {
        ts: nowIso(),
        module: "REQUESTS",
        by: req.requester,
        message:
          status === "BORRADOR"
            ? "Guardado como BORRADOR."
            : "Enviada a Sales Support (ENVIADA).",
      }),
    };
    props.setRequests((prev) => [clean, ...prev]);
  }

  function saveDraftOnly() {
    saveToInbox(draft, "BORRADOR");
    setCreating(false);
    setDraft(newRequestTemplate("NICOLAS CUADRA"));
  }

  function submitDraft() {
    saveToInbox(draft, "ENVIADA");
    setCreating(false);
    setDraft(newRequestTemplate("NICOLAS CUADRA"));
  }

  function saveAndDuplicateDraft() {
    // guarda como enviada y deja el duplicado abierto como borrador
    saveToInbox(draft, "ENVIADA");
    setCreating(true);
    setDraft(duplicateAsDraft(draft));
  }

  function startNewFromExisting(req: OrderRequest) {
    setCreating(true);
    setExpandedId(null);
    setDraft(duplicateAsDraft(req));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="mf-card" style={{ padding: 16 }}>
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
              style={{ fontWeight: 900, color: "var(--mf-blue)", fontSize: 16 }}
            >
              Solicitudes de Creación de Órdenes
            </div>
            <div className="mf-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Comercial crea solicitud → Sales Support asigna PI → aparece como
              Pedido Pendiente.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="mf-btn mf-btn-primary"
              onClick={() => setCreating((v) => !v)}
            >
              {creating ? "Cerrar" : "+ Nueva Solicitud"}
            </button>
          </div>
        </div>
      </div>

      {creating && (
        <div className="mf-card" style={{ padding: 16 }}>
          <div
            style={{
              fontWeight: 900,
              color: "var(--mf-blue)",
              marginBottom: 10,
            }}
          >
            Crear Solicitud (Comercial)
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            <Field label="Client">
              <input
                value={draft.client}
                onChange={(e) => updateDraft({ client: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <Field label="Destination">
              <input
                value={draft.destination}
                onChange={(e) => updateDraft({ destination: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <Field label="Incoterm">
              <select
                value={draft.incoterm}
                onChange={(e) =>
                  updateDraft({ incoterm: e.target.value as any })
                }
                style={inputStyle}
              >
                <option value="CFR">CFR</option>
                <option value="CIF">CIF</option>
                <option value="FOB">FOB</option>
              </select>
            </Field>

            <Field label="Shipment ETD (YYYY-MM)">
              <input
                value={draft.shipmentEtdMonth}
                onChange={(e) =>
                  updateDraft({ shipmentEtdMonth: e.target.value })
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Payment Method">
              <input
                value={draft.paymentMethod}
                onChange={(e) => updateDraft({ paymentMethod: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <Field label="Inspection">
              <select
                value={draft.inspection ? "YES" : "NO"}
                onChange={(e) =>
                  updateDraft({ inspection: e.target.value === "YES" })
                }
                style={inputStyle}
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </Field>

            <Field label="Additional Label">
              <select
                value={draft.additionalLabel}
                onChange={(e) =>
                  updateDraft({ additionalLabel: e.target.value as any })
                }
                style={inputStyle}
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </Field>

            <Field label="Consignee">
              <input
                value={draft.consignee || ""}
                onChange={(e) => updateDraft({ consignee: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <Field label="Notify">
              <input
                value={draft.notify || ""}
                onChange={(e) => updateDraft({ notify: e.target.value })}
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ marginTop: 10 }}>
            <Field label="Additional Requirements">
              <textarea
                value={draft.additionalRequirements || ""}
                onChange={(e) =>
                  updateDraft({ additionalRequirements: e.target.value })
                }
                style={{ ...inputStyle, height: 70 }}
              />
            </Field>
          </div>

          <div
            style={{ marginTop: 12, fontWeight: 900, color: "var(--mf-blue)" }}
          >
            Items (mix permitido)
          </div>

          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "var(--mf-grey-light)" }}>
                  <th style={th}>Product</th>
                  <th style={th}>Calidad</th>
                  <th style={th}>Size</th>
                  <th style={th}>Precio</th>
                  <th style={th}>UoM</th>
                  <th style={th}>Volumen (kg)</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {draft.items.map((it) => (
                  <tr
                    key={it.id}
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <td style={td}>
                      <input
                        value={it.product}
                        onChange={(e) =>
                          updateDraftLine(it.id, { product: e.target.value })
                        }
                        style={cellInput}
                      />
                    </td>
                    <td style={td}>
                      <select
                        value={it.quality}
                        onChange={(e) =>
                          updateDraftLine(it.id, {
                            quality: e.target.value as any,
                          })
                        }
                        style={cellInput}
                      >
                        <option value="Premium">Premium</option>
                        <option value="Industrial A">Industrial A</option>
                        <option value="Industrial B">Industrial B</option>
                        <option value="Grado">Grado</option>
                      </select>
                    </td>
                    <td style={td}>
                      <input
                        value={it.size}
                        onChange={(e) =>
                          updateDraftLine(it.id, { size: e.target.value })
                        }
                        style={cellInput}
                      />
                    </td>
                    <td style={td}>
                      <input
                        value={String(it.price.value)}
                        onChange={(e) =>
                          updateDraftLine(it.id, {
                            price: {
                              ...it.price,
                              value: Number(e.target.value || 0),
                            },
                          })
                        }
                        style={cellInput}
                        type="number"
                        step="0.01"
                      />
                    </td>
                    <td style={td}>
                      <select
                        value={it.price.uom}
                        onChange={(e) =>
                          updateDraftLine(it.id, {
                            price: { ...it.price, uom: e.target.value as any },
                          })
                        }
                        style={cellInput}
                      >
                        <option value="kg">USD/kg</option>
                        <option value="lb">USD/lb</option>
                      </select>
                    </td>
                    <td style={td}>
                      <input
                        value={String(it.volume.value)}
                        onChange={(e) =>
                          updateDraftLine(it.id, {
                            volume: {
                              value: Number(e.target.value || 0),
                              uom: "kg",
                            },
                          })
                        }
                        style={cellInput}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td style={{ ...td, width: 90 }}>
                      <button
                        className="mf-btn mf-btn-secondary"
                        onClick={() => removeDraftLine(it.id)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <button className="mf-btn mf-btn-secondary" onClick={addDraftLine}>
              + Agregar línea
            </button>

            <button className="mf-btn mf-btn-secondary" onClick={saveDraftOnly}>
              Guardar borrador
            </button>

            <button className="mf-btn mf-btn-secondary" onClick={submitDraft}>
              Enviar solicitud
            </button>

            <button
              className="mf-btn mf-btn-primary"
              onClick={saveAndDuplicateDraft}
            >
              Guardar y Duplicar
            </button>
          </div>
        </div>
      )}

      <div className="mf-card" style={{ padding: 16 }}>
        <div
          style={{ fontWeight: 900, color: "var(--mf-blue)", marginBottom: 10 }}
        >
          Bandeja de Solicitudes
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: "var(--mf-grey-light)" }}>
                <th style={th}>Solicitud</th>
                <th style={th}>Requester</th>
                <th style={th}>Items</th>
                <th style={th}>Vol. Total</th>
                <th style={th}>Precio prom.</th>
                <th style={th}>Shipping Instr.</th>
                <th style={th}>PI</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const isExpanded = expandedId === r.id;
                const totalKg = sumVolumeKg(r.items);
                const avgPrice = weightedAvgPriceUsdKg(r.items);
                const shipStatus = deriveShippingStatus(r.consignee, r.notify);

                return (
                  <React.Fragment key={r.id}>
                    <tr
                      onClick={() => toggleExpand(r.id)}
                      style={{
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        cursor: "pointer",
                      }}
                    >
                      <td style={{ ...td, fontWeight: 900 }}>
                        {r.id} • {requestRowTitle(r)}
                      </td>
                      <td style={td}>{r.requester}</td>
                      <td style={td}>{r.items.length}</td>
                      <td style={td}>{fmt(totalKg)} kg</td>
                      <td style={td}>USD {avgPrice.toFixed(2)}/kg</td>
                      <td style={td}>
                        <span
                          className={`mf-pill ${
                            shipStatus === "OK"
                              ? "mf-pill-green"
                              : "mf-pill-yellow"
                          }`}
                        >
                          {shipStatus}
                        </span>
                      </td>
                      <td style={td}>
                        {r.pi ? (
                          <span className="mf-chip">{r.pi}</span>
                        ) : (
                          <span className="mf-muted">—</span>
                        )}
                      </td>
                      <td style={td}>
                        <span className="mf-muted" style={{ fontWeight: 800 }}>
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                        <td colSpan={8} style={{ padding: 12 }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="mf-btn mf-btn-primary"
                                onClick={() => openAssignPi(r)}
                              >
                                Asignar PI
                              </button>

                              <button
                                className="mf-btn mf-btn-secondary"
                                onClick={() => startNewFromExisting(r)}
                                title="Crea nueva solicitud copiando esta como BORRADOR"
                              >
                                Duplicar (nuevo BORRADOR)
                              </button>

                              <button
                                className="mf-btn mf-btn-secondary"
                                onClick={() => deleteRequest(r.id)}
                                title="Eliminar solicitud"
                              >
                                Eliminar
                              </button>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: 10,
                              }}
                            >
                              <Field label="Consignee (editable)">
                                <input
                                  value={r.consignee || ""}
                                  onChange={(e) =>
                                    updateRequest(r.id, {
                                      consignee: e.target.value,
                                    })
                                  }
                                  onBlur={() =>
                                    updateRequest(
                                      r.id,
                                      {},
                                      "Se actualizó Consignee."
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </Field>

                              <Field label="Notify (editable)">
                                <input
                                  value={r.notify || ""}
                                  onChange={(e) =>
                                    updateRequest(r.id, {
                                      notify: e.target.value,
                                    })
                                  }
                                  onBlur={() =>
                                    updateRequest(
                                      r.id,
                                      {},
                                      "Se actualizó Notify."
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </Field>
                            </div>

                            <div className="mf-muted" style={{ fontSize: 12 }}>
                              * Solo Consignee/Notify se editan aquí. Esto
                              alimenta Shipping Instructions en Pedidos.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Asignar PI */}
      {piModalOpen && (
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
          onClick={() => setPiModalOpen(false)}
        >
          <div
            className="mf-card"
            style={{ width: "min(520px, 100%)", padding: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ fontWeight: 900, color: "var(--mf-blue)", fontSize: 16 }}
            >
              Asignar PI
            </div>
            <div className="mf-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Formato: <b>XXXXX</b> o <b>XXXX-XXXXX</b>
            </div>

            <div style={{ marginTop: 12 }}>
              <Field label="PI">
                <input
                  value={piValue}
                  onChange={(e) => {
                    setPiValue(e.target.value);
                    setPiError(null);
                  }}
                  style={inputStyle}
                  placeholder="Ej: 12345 o 1234-12345"
                />
              </Field>
              {piError && (
                <div
                  style={{
                    marginTop: 8,
                    color: "var(--mf-red)",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {piError}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => setPiModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="mf-btn mf-btn-primary"
                onClick={confirmAssignPi}
              >
                Guardar PI y crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
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
  border: "1px solid var(--mf-grey)",
  borderRadius: 10,
  padding: "10px 10px",
  fontSize: 13,
  outline: "none",
  background: "var(--mf-white)",
  color: "var(--mf-text)",
};

const th: React.CSSProperties = { textAlign: "left", padding: "10px 10px" };
const td: React.CSSProperties = { padding: "10px 10px" };

const cellInput: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--mf-grey)",
  borderRadius: 10,
  padding: "8px 8px",
  fontSize: 13,
  outline: "none",
  background: "var(--mf-white)",
  color: "var(--mf-text)",
};
