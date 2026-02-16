import React, { useState } from "react";
import {
  speciesOptions,
  productOptions,
  cutOptions,
  qualityOptions,
  caliberOptions,
  boxTypeOptions,
  boxFormatOptions,
  paymentMethodOptions,
  incotermOptions,
  customers,
  countries,
  ports,
} from "../mockData/masterData";

type PriceUom = "kg" | "lb";

type Line = {
  species: string;
  product: string;
  cut: string;
  quality: string;
  size: string;
  boxType: string;
  boxFormat: string;
  volumeKg: number;
  priceText: string;
  priceUom: PriceUom;
};

export default function NewOrderRequestPage() {
  // Header fields
  const [customer, setCustomer] = useState("");
  const [country, setCountry] = useState("");
  const [port, setPort] = useState("");
  const [etdProposed, setEtdProposed] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [incoterm, setIncoterm] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // Line items
  const [lines, setLines] = useState<Line[]>([
    {
      species: "COHO",
      product: "HG",
      cut: "Scale Off",
      quality: "Premium",
      size: "9 lbs Up",
      boxType: "30 Kg",
      boxFormat: "Fijo",
      volumeKg: 0,
      priceText: "",
      priceUom: "kg",
    },
  ]);

  function setLine(idx: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        species: "COHO",
        product: "HG",
        cut: "Scale Off",
        quality: "Premium",
        size: "9 lbs Up",
        boxType: "30 Kg",
        boxFormat: "Fijo",
        volumeKg: 0,
        priceText: "",
        priceUom: "kg",
      },
    ]);
  }

  function removeLine(idx: number) {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((_, i) => i !== idx));
    }
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

  function handleSubmit() {
    // Validation
    if (!customer) {
      alert("Por favor selecciona un cliente");
      return;
    }
    if (!country) {
      alert("Por favor selecciona un país");
      return;
    }
    if (!port) {
      alert("Por favor selecciona un puerto");
      return;
    }
    if (!etdProposed) {
      alert("Por favor ingresa el ETD propuesto");
      return;
    }
    if (!paymentMethod) {
      alert("Por favor selecciona un modo de pago");
      return;
    }
    if (!incoterm) {
      alert("Por favor selecciona un incoterm");
      return;
    }

    // Validate lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.priceText || parseFloat(line.priceText) <= 0) {
        alert(`Línea ${i + 1}: Por favor ingresa un precio válido`);
        return;
      }
      if (!line.volumeKg || line.volumeKg <= 0) {
        alert(`Línea ${i + 1}: Por favor ingresa un volumen válido`);
        return;
      }
    }

    // TODO: Aquí enviarías los datos a la API
    const requestData = {
      customer,
      country,
      port,
      etdProposed,
      paymentMethod,
      incoterm,
      additionalRequirements,
      items: lines.map((l) => ({
        species: l.species,
        product: l.product,
        cut: l.cut,
        quality: l.quality,
        size: l.size,
        boxType: l.boxType,
        boxFormat: l.boxFormat,
        volumeKg: l.volumeKg,
        price: {
          value: parseFloat(l.priceText.replace(",", ".")),
          uom: l.priceUom,
        },
      })),
    };

    console.log("Enviando solicitud:", requestData);
    alert("Solicitud creada exitosamente (demo)");
  }

  return (
    <div className="mf-card" style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div className="mf-h1" style={{ marginBottom: 24 }}>
        Nueva Solicitud de Orden
      </div>

      {/* Header Section */}
      <div
        className="mf-card"
        style={{ padding: 16, marginBottom: 20, background: "#f8f9fa" }}
      >
        <div className="mf-h2" style={{ marginBottom: 16, fontSize: 16 }}>
          Información General
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {/* Cliente */}
          <div>
            <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Cliente *
            </label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="mf-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="">Seleccionar...</option>
              {customers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* País */}
          <div>
            <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              País *
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mf-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="">Seleccionar...</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Puerto */}
          <div>
            <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Puerto *
            </label>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="mf-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="">Seleccionar...</option>
              {ports.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* ETD Propuesto */}
          <div>
            <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              ETD Propuesto * (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={etdProposed}
              onChange={(e) => setEtdProposed(e.target.value)}
              className="mf-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
              }}
            />
          </div>

          {/* Modo de Pago */}
          <div>
            <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Modo de Pago *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mf-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="">Seleccionar...</option>
              {paymentMethodOptions.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Incoterm */}
          <div>
            <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Incoterm *
            </label>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="mf-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="">Seleccionar...</option>
              {incotermOptions.map((inc) => (
                <option key={inc} value={inc}>
                  {inc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requerimientos Adicionales */}
        <div style={{ marginTop: 16 }}>
          <label className="mf-muted" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Requerimientos Adicionales
          </label>
          <textarea
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            placeholder="Ej: Etiqueta en español, empaque especial, etc."
            className="mf-input"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: 14,
              minHeight: 80,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>
      </div>

      {/* Items Section */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div className="mf-h2" style={{ fontSize: 16 }}>
            Ítems de la Solicitud
          </div>
          <button
            className="mf-btn mf-btn-primary"
            onClick={addLine}
            style={{ padding: "8px 16px" }}
          >
            + Agregar Ítem
          </button>
        </div>

        {lines.map((line, idx) => (
          <div
            key={idx}
            className="mf-card"
            style={{ padding: 16, marginBottom: 12, background: "#fff" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="mf-muted" style={{ fontSize: 14, fontWeight: 600 }}>
                Ítem #{idx + 1}
              </div>
              {lines.length > 1 && (
                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={() => removeLine(idx)}
                  style={{ padding: "4px 12px", fontSize: 12 }}
                >
                  Eliminar
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
              }}
            >
              {/* Especie */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Especie
                </label>
                <select
                  value={line.species}
                  onChange={(e) => setLine(idx, { species: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {speciesOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Producto */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Producto
                </label>
                <select
                  value={line.product}
                  onChange={(e) => setLine(idx, { product: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {productOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Corte */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Corte
                </label>
                <select
                  value={line.cut}
                  onChange={(e) => setLine(idx, { cut: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {cutOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calidad */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Calidad
                </label>
                <select
                  value={line.quality}
                  onChange={(e) => setLine(idx, { quality: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {qualityOptions.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calibre */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Calibre
                </label>
                <select
                  value={line.size}
                  onChange={(e) => setLine(idx, { size: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {caliberOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Caja */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Tipo Caja
                </label>
                <select
                  value={line.boxType}
                  onChange={(e) => setLine(idx, { boxType: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {boxTypeOptions.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formato Caja */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Formato Caja
                </label>
                <select
                  value={line.boxFormat}
                  onChange={(e) => setLine(idx, { boxFormat: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {boxFormatOptions.map((bf) => (
                    <option key={bf} value={bf}>
                      {bf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Volumen */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Volumen (kg)
                </label>
                <input
                  type="number"
                  value={line.volumeKg || ""}
                  onChange={(e) =>
                    setLine(idx, { volumeKg: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Precio */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Precio
                </label>
                <input
                  type="text"
                  value={line.priceText}
                  onChange={(e) => setLine(idx, { priceText: e.target.value })}
                  placeholder="6.80"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* UoM Precio */}
              <div>
                <label className="mf-muted" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  UoM
                </label>
                <select
                  value={line.priceUom}
                  onChange={(e) =>
                    setLine(idx, { priceUom: e.target.value as PriceUom })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>

              {/* Copiar Precio */}
              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={() => copyPrice(idx)}
                  style={{ padding: "8px 12px", fontSize: 12, width: "100%" }}
                  title="Copia este precio a todas las líneas"
                >
                  Copiar precio ↑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
          paddingTop: 20,
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <button
          className="mf-btn mf-btn-secondary"
          style={{ padding: "12px 24px" }}
          onClick={() => {
            if (window.confirm("¿Estás seguro de cancelar? Se perderán todos los cambios.")) {
              window.location.reload();
            }
          }}
        >
          Cancelar
        </button>
        <button
          className="mf-btn mf-btn-primary"
          style={{ padding: "12px 32px" }}
          onClick={handleSubmit}
        >
          Crear Solicitud
        </button>
      </div>
    </div>
  );
}
