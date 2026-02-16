import React from "react";
import "../styles/mf.css";

export type CalculatorContext = {
  country?: string;
  product?: string;
  priceUsdPerKg?: number;
};

export function CalculatorPage(props: { ctx: CalculatorContext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="mf-card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, color: "var(--mf-blue)" }}>
          Calculadora de precios (host)
        </div>
        <div className="mf-muted" style={{ marginTop: 8, fontSize: 13 }}>
          Aquí se “monta” tu calculadora existente. Por ahora dejamos el
          contexto pre-cargado.
        </div>

        <div style={{ marginTop: 14 }} className="mf-kv">
          <div className="k">País</div>
          <div className="v">{props.ctx.country ?? "-"}</div>
          <div className="k">Producto</div>
          <div className="v">{props.ctx.product ?? "-"}</div>
          <div className="k">Precio</div>
          <div className="v">
            {props.ctx.priceUsdPerKg != null
              ? `${props.ctx.priceUsdPerKg.toFixed(2)} USD/kg`
              : "-"}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            className="mf-muted"
            style={{
              height: 260,
              border: "1px dashed var(--mf-grey)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Aquí irá el componente real de la calculadora (sin cambiar su
            lógica)
          </div>
        </div>
      </div>
    </div>
  );
}
