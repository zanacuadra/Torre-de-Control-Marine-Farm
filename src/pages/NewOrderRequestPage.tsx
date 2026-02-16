import React, { useMemo, useState } from "react";

type PriceUom = "kg" | "lb";

type Line = {
  product: string;
  quality: string;
  size: string;
  boxType: string;
  boxFormat: string;
  volumeKg: number;
  priceText: string; // ✅ string para poder borrar
  priceUom: PriceUom;
};

export default function NewOrderRequestPage() {
  const [lines, setLines] = useState<Line[]>([
    {
      product: "Coho HG IQF",
      quality: "Premium",
      size: "9 lbs Up",
      boxType: "30 Kg",
      boxFormat: "Fijo",
      volumeKg: 20000,
      priceText: "", // ✅ parte vacío
      priceUom: "kg",
    },
    {
      product: "Coho HG IQF",
      quality: "Premium",
      size: "9 lbs Up",
      boxType: "30 Kg",
      boxFormat: "Fijo",
      volumeKg: 20000,
      priceText: "",
      priceUom: "kg",
    },
  ]);

  function setLine(idx: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  }

  function copyPrice(fromIdx: number) {
    const base = lines[fromIdx];
    setLines((prev) =>
      prev.map((l, i) =>
        i === fromIdx
          ? l
          : { ...l, priceText: base.priceText, priceUom: base.priceUom }
      )
    );
  }

  // solo para demo
  const parsed = useMemo(() => {
    return lines.map((l) => ({
      ...l,
      priceValue: Number(String(l.priceText).replace(",", ".")) || 0,
    }));
  }, [lines]);

  return (
    <div className="mf-card" style={{ padding: 16 }}>
      <div className="mf-h1">Nueva Solicitud</div>

      {lines.map((l, idx) => (
        <div
          key={idx}
          className="mf-card"
          style={{ padding: 12, marginTop: 12 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 200px 110px",
              gap: 12,
            }}
          >
            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                Precio
              </div>

              <input
                value={l.priceText}
                onChange={(e) => setLine(idx, { priceText: e.target.value })}
                placeholder="Ej: 6.80"
                className="mf-input"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                UoM
              </div>
              <select
                value={l.priceUom}
                onChange={(e) =>
                  setLine(idx, { priceUom: e.target.value as PriceUom })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => copyPrice(idx)}
              >
                Copiar precio ↑
              </button>
            </div>
          </div>

          <div className="mf-muted" style={{ marginTop: 8, fontSize: 12 }}>
            Precio numérico (demo): {parsed[idx].priceValue.toFixed(2)} USD/
            {l.priceUom}
          </div>
        </div>
      ))}
    </div>
  );
}
