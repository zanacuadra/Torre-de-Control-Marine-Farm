import React, { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import {
  paymentStatuses,
  type CustomerCreditStatus,
  type PendingInvoice,
} from "../mockData/payments";
import "../styles/mf.css";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(dateISO: string, days: number) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Días Factura = diferencia en días entre hoy y (fechaFactura + 30 días)
 * - Si > 30 => amarillo
 * - Si > 60 => rojo
 * Tomamos el máximo de todas las facturas pendientes del cliente.
 */
function daysFactura(invoiceDateISO: string) {
  const today = startOfToday();
  const due = addDays(invoiceDateISO, 30);
  const diffMs = today.getTime() - due.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function maxDaysFactura(invoices: PendingInvoice[]) {
  if (!invoices.length) return 0;
  return Math.max(...invoices.map((i) => daysFactura(i.invoiceDate)));
}

function daysPillClass(days: number) {
  if (days > 60) return "mf-pill-red";
  if (days > 30) return "mf-pill-yellow";
  return "mf-pill-blue";
}

function usd(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function PaymentsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return paymentStatuses
      .map((c) => ({
        ...c,
        maxDays: maxDaysFactura(c.invoices),
      }))
      .sort((a, b) => b.debtUsd - a.debtUsd);
  }, []);

  function toggleExpand(row: CustomerCreditStatus & { maxDays: number }) {
    setExpandedId((prev) => (prev === row.id ? null : row.id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DataTable<CustomerCreditStatus & { maxDays: number }>
        title="Status de Pagos y Créditos"
        actions={
          <>
            <button className="mf-btn mf-btn-secondary">Exportar CSV</button>
            <button
              className="mf-btn mf-btn-secondary"
              onClick={() => alert("Carga desde ERP (dummy)")}
            >
              Sincronizar ERP
            </button>
          </>
        }
        data={rows}
        onRowClick={toggleExpand}
        expandedRowId={expandedId}
        renderExpandedRow={(r) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontWeight: 900, color: "var(--mf-blue)" }}>
              Facturas pendientes — {r.customer}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "var(--mf-grey-light)" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Factura
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Fecha
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Monto USD
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Días Factura
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.invoices.map((inv) => {
                    const d = daysFactura(inv.invoiceDate);
                    return (
                      <tr
                        key={inv.id}
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <td
                          style={{
                            padding: "10px 10px",
                            whiteSpace: "nowrap",
                            fontWeight: 800,
                          }}
                        >
                          {inv.invoiceNo}
                        </td>
                        <td
                          style={{ padding: "10px 10px", whiteSpace: "nowrap" }}
                        >
                          {new Date(inv.invoiceDate).toLocaleDateString(
                            "es-CL"
                          )}
                        </td>
                        <td
                          style={{ padding: "10px 10px", whiteSpace: "nowrap" }}
                        >
                          ${usd(inv.amountUsd)}
                        </td>
                        <td
                          style={{ padding: "10px 10px", whiteSpace: "nowrap" }}
                        >
                          <span className={`mf-pill ${daysPillClass(d)}`}>
                            {d}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mf-muted" style={{ fontSize: 12 }}>
              * Días Factura = hoy - (fecha factura + 30 días). Se marca
              amarillo &gt; 30, rojo &gt; 60.
            </div>
          </div>
        )}
        columns={[
          {
            header: "Cliente",
            render: (r) => (
              <span style={{ fontWeight: 900 }}>{r.customer}</span>
            ),
          },
          { header: "Mercado", render: (r) => r.market },
          {
            header: "Deuda USD",
            render: (r) => (
              <span style={{ fontWeight: 900 }}>${usd(r.debtUsd)}</span>
            ),
          },
          {
            header: "Seguro Vigente USD",
            render: (r) => <>${usd(r.insuranceUsd)}</>,
          },
          {
            header: "Días Factura (máx)",
            render: (r) => (
              <span className={`mf-pill ${daysPillClass(r.maxDays)}`}>
                {r.maxDays}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

export default PaymentsPage;
