import React, { useMemo, useState } from "react";
import "../styles/mf.css";
import {
  weeklyFreshData,
  type Weekday,
  type LatamAsiaDayRow,
} from "../mockData/weeklyFresh";

function fmt(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function pct(n: number) {
  if (!isFinite(n)) return "—";
  return (n * 100).toFixed(0) + "%";
}

function safeDiv(a: number, b: number) {
  if (!b) return 0;
  return a / b;
}

function SectionTitle(props: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <div
        className="mf-section-title-compact"
        style={{ fontWeight: 900, color: "var(--mf-blue)", fontSize: 16 }}
      >
        {props.title}
      </div>
      <div className="mf-muted mf-muted-compact">{props.subtitle}</div>
    </div>
  );
}

export function WeeklyFreshPlanPage() {
  const [brExpanded, setBrExpanded] = useState<Record<string, boolean>>({});
  const [cnExpanded, setCnExpanded] = useState<Record<string, boolean>>({});

  const usaTotals = useMemo(() => {
    const planned = weeklyFreshData.usa.reduce((a, r) => a + r.plannedLbs, 0);
    const produced = weeklyFreshData.usa.reduce((a, r) => a + r.producedLbs, 0);
    const excess = weeklyFreshData.usa.reduce((a, r) => a + r.excessLbs, 0);
    const compNoExcess = safeDiv(produced - excess, planned);
    return { planned, produced, excess, compNoExcess };
  }, []);

  const brTotals = useMemo(() => {
    const planned = weeklyFreshData.brazil.reduce((a, r) => a + r.plannedKg, 0);
    const produced = weeklyFreshData.brazil.reduce(
      (a, r) => a + r.producedKg,
      0
    );
    return { planned, produced, comp: safeDiv(produced, planned) };
  }, []);

  const cnTotals = useMemo(() => {
    const planned = weeklyFreshData.china.reduce((a, r) => a + r.plannedKg, 0);
    const produced = weeklyFreshData.china.reduce(
      (a, r) => a + r.producedKg,
      0
    );
    return { planned, produced, comp: safeDiv(produced, planned) };
  }, []);

  function toggleRow(
    mapSetter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    day: Weekday
  ) {
    mapSetter((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  return (
    <div
      className="mf-page-compact"
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      {/* ✅ eliminamos el header duplicado y dejamos solo las tablas */}

      {/* ===================== 1) USA ===================== */}
      <div className="mf-card mf-card-compact">
        <SectionTitle
          title="1. USA"
          subtitle="Unidades: Libras (lbs). Incluye Excedentes."
        />

        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table className="mf-table-compact">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Día</th>
                <th style={{ textAlign: "left" }}>Vol. Programado</th>
                <th style={{ textAlign: "left" }}>Vol. Producido</th>
                <th style={{ textAlign: "left" }}>Excedentes</th>
                <th style={{ textAlign: "left" }}>Cump. (Sin Excedentes)</th>
              </tr>
            </thead>
            <tbody>
              {weeklyFreshData.usa.map((r) => {
                const compNoExcess = safeDiv(
                  r.producedLbs - r.excessLbs,
                  r.plannedLbs
                );
                const pill =
                  compNoExcess >= 0.95
                    ? "mf-pill-green"
                    : compNoExcess >= 0.85
                    ? "mf-pill-yellow"
                    : "mf-pill-red";

                return (
                  <tr key={r.day}>
                    <td style={{ fontWeight: 900 }}>{r.day}</td>
                    <td>{fmt(r.plannedLbs)} lbs</td>
                    <td>{fmt(r.producedLbs)} lbs</td>
                    <td>{fmt(r.excessLbs)} lbs</td>
                    <td>
                      <span className={`mf-pill mf-pill-compact ${pill}`}>
                        {pct(compNoExcess)}
                      </span>
                    </td>
                  </tr>
                );
              })}

              <tr className="mf-total-row">
                <td>TOTAL</td>
                <td>{fmt(usaTotals.planned)} lbs</td>
                <td>{fmt(usaTotals.produced)} lbs</td>
                <td>{fmt(usaTotals.excess)} lbs</td>
                <td>
                  <span
                    className={`mf-pill mf-pill-compact ${
                      usaTotals.compNoExcess >= 0.95
                        ? "mf-pill-green"
                        : usaTotals.compNoExcess >= 0.85
                        ? "mf-pill-yellow"
                        : "mf-pill-red"
                    }`}
                  >
                    {pct(usaTotals.compNoExcess)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== 2) BRASIL ===================== */}
      <div className="mf-card mf-card-compact">
        <SectionTitle
          title="2. Brasil"
          subtitle="Unidades: Kg. Click en un día para ver clientes. Sin excedentes."
        />

        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table className="mf-table-compact">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Día</th>
                <th style={{ textAlign: "left" }}>Vol. Programado</th>
                <th style={{ textAlign: "left" }}>Vol. Producido</th>
                <th style={{ textAlign: "left" }}>Cump.</th>
              </tr>
            </thead>

            <tbody>
              {weeklyFreshData.brazil.map((r) => {
                const comp = safeDiv(r.producedKg, r.plannedKg);
                const expanded = !!brExpanded[r.day];
                const pill =
                  comp >= 0.95
                    ? "mf-pill-green"
                    : comp >= 0.85
                    ? "mf-pill-yellow"
                    : "mf-pill-red";

                return (
                  <React.Fragment key={r.day}>
                    <tr
                      onClick={() => toggleRow(setBrExpanded, r.day)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: 900 }}>
                        {r.day}{" "}
                        <span className="mf-muted">{expanded ? "▲" : "▼"}</span>
                      </td>
                      <td>{fmt(r.plannedKg)} kg</td>
                      <td>{fmt(r.producedKg)} kg</td>
                      <td>
                        <span className={`mf-pill mf-pill-compact ${pill}`}>
                          {pct(comp)}
                        </span>
                      </td>
                    </tr>

                    {expanded && (
                      <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                        <td colSpan={4} style={{ padding: "8px 8px" }}>
                          <DetailsTable rows={r} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              <tr className="mf-total-row">
                <td>TOTAL</td>
                <td>{fmt(brTotals.planned)} kg</td>
                <td>{fmt(brTotals.produced)} kg</td>
                <td>
                  <span
                    className={`mf-pill mf-pill-compact ${
                      brTotals.comp >= 0.95
                        ? "mf-pill-green"
                        : brTotals.comp >= 0.85
                        ? "mf-pill-yellow"
                        : "mf-pill-red"
                    }`}
                  >
                    {pct(brTotals.comp)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== 3) CHINA ===================== */}
      <div className="mf-card mf-card-compact">
        <SectionTitle
          title="3. China"
          subtitle="Unidades: Kg. Click en un día para ver clientes. Sin excedentes."
        />

        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table className="mf-table-compact">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Día</th>
                <th style={{ textAlign: "left" }}>Vol. Programado</th>
                <th style={{ textAlign: "left" }}>Vol. Producido</th>
                <th style={{ textAlign: "left" }}>Cump.</th>
              </tr>
            </thead>

            <tbody>
              {weeklyFreshData.china.map((r) => {
                const comp = safeDiv(r.producedKg, r.plannedKg);
                const expanded = !!cnExpanded[r.day];
                const pill =
                  comp >= 0.95
                    ? "mf-pill-green"
                    : comp >= 0.85
                    ? "mf-pill-yellow"
                    : "mf-pill-red";

                return (
                  <React.Fragment key={r.day}>
                    <tr
                      onClick={() => toggleRow(setCnExpanded, r.day)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: 900 }}>
                        {r.day}{" "}
                        <span className="mf-muted">{expanded ? "▲" : "▼"}</span>
                      </td>
                      <td>{fmt(r.plannedKg)} kg</td>
                      <td>{fmt(r.producedKg)} kg</td>
                      <td>
                        <span className={`mf-pill mf-pill-compact ${pill}`}>
                          {pct(comp)}
                        </span>
                      </td>
                    </tr>

                    {expanded && (
                      <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                        <td colSpan={4} style={{ padding: "8px 8px" }}>
                          <DetailsTable rows={r} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              <tr className="mf-total-row">
                <td>TOTAL</td>
                <td>{fmt(cnTotals.planned)} kg</td>
                <td>{fmt(cnTotals.produced)} kg</td>
                <td>
                  <span
                    className={`mf-pill mf-pill-compact ${
                      cnTotals.comp >= 0.95
                        ? "mf-pill-green"
                        : cnTotals.comp >= 0.85
                        ? "mf-pill-yellow"
                        : "mf-pill-red"
                    }`}
                  >
                    {pct(cnTotals.comp)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DetailsTable({ rows }: { rows: LatamAsiaDayRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="mf-table-compact">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Cliente</th>
            <th style={{ textAlign: "left" }}>Vol. Programado</th>
            <th style={{ textAlign: "left" }}>Vol. Producido</th>
            <th style={{ textAlign: "left" }}>Despacho</th>
          </tr>
        </thead>
        <tbody>
          {rows.details.map((d, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: 900 }}>{d.customer}</td>
              <td>{d.plannedKg.toLocaleString("es-CL")} kg</td>
              <td>{d.producedKg.toLocaleString("es-CL")} kg</td>
              <td>
                <span
                  className={`mf-pill mf-pill-compact ${
                    d.dispatched ? "mf-pill-green" : "mf-pill-yellow"
                  }`}
                >
                  {d.dispatched ? "DESPACHADO" : "PEND"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeeklyFreshPlanPage;
