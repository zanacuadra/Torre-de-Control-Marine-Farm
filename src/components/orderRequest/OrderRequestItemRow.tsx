import React from "react";
import {
  products,
  qualities,
  calibers,
  boxTypes,
  boxFormats,
} from "../../mockData/masterData";

export type DraftLine = {
  product: string;
  quality: string;
  caliber: string;
  boxType: string;
  boxFormat: string;
  priceValue: number;
  priceUom: "kg" | "lb";
};

export function OrderRequestItemRow(props: {
  index: number;
  line: DraftLine;

  canCopyFromAbove: boolean;
  aboveLine?: DraftLine;

  onChange: (next: DraftLine) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onCopyPriceFromAbove: () => void;
}) {
  const { index, line, onChange } = props;

  return (
    <tr>
      <td style={{ width: 160 }}>
        <select
          value={line.product}
          onChange={(e) => onChange({ ...line, product: e.target.value })}
          style={{
            width: "100%",
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--mf-grey)",
            padding: "0 10px",
          }}
        >
          {products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </td>

      <td style={{ width: 140 }}>
        <select
          value={line.quality}
          onChange={(e) => onChange({ ...line, quality: e.target.value })}
          style={{
            width: "100%",
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--mf-grey)",
            padding: "0 10px",
          }}
        >
          {qualities.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </td>

      <td style={{ width: 140 }}>
        <select
          value={line.caliber}
          onChange={(e) => onChange({ ...line, caliber: e.target.value })}
          style={{
            width: "100%",
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--mf-grey)",
            padding: "0 10px",
          }}
        >
          {calibers.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>

      <td style={{ width: 170 }}>
        <select
          value={line.boxType}
          onChange={(e) => onChange({ ...line, boxType: e.target.value })}
          style={{
            width: "100%",
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--mf-grey)",
            padding: "0 10px",
          }}
        >
          {boxTypes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </td>

      <td style={{ width: 170 }}>
        <select
          value={line.boxFormat}
          onChange={(e) => onChange({ ...line, boxFormat: e.target.value })}
          style={{
            width: "100%",
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--mf-grey)",
            padding: "0 10px",
          }}
        >
          {boxFormats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </td>

      <td style={{ width: 180 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            value={Number.isFinite(line.priceValue) ? line.priceValue : 0}
            onChange={(e) =>
              onChange({
                ...line,
                priceValue: Number(e.target.value || 0),
              })
            }
            style={{
              width: 110,
              height: 34,
              borderRadius: 10,
              border: "1px solid var(--mf-grey)",
              padding: "0 10px",
            }}
          />
          <select
            value={line.priceUom}
            onChange={(e) =>
              onChange({
                ...line,
                priceUom: e.target.value === "lb" ? "lb" : "kg",
              })
            }
            style={{
              width: 60,
              height: 34,
              borderRadius: 10,
              border: "1px solid var(--mf-grey)",
              padding: "0 8px",
            }}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>

        {props.canCopyFromAbove ? (
          <div style={{ marginTop: 6 }}>
            <button
              className="mf-btn mf-btn-secondary"
              style={{ padding: "6px 10px", fontSize: 12 }}
              onClick={props.onCopyPriceFromAbove}
              title="Copiar precio desde la línea superior"
            >
              Copiar precio ↑
            </button>
          </div>
        ) : null}
      </td>

      <td style={{ width: 240 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            className="mf-btn mf-btn-secondary"
            style={{ padding: "8px 10px" }}
            onClick={props.onDuplicate}
            title="Duplicar línea"
          >
            Duplicar
          </button>
          <button
            className="mf-btn mf-btn-secondary"
            style={{ padding: "8px 10px" }}
            onClick={props.onRemove}
            title="Eliminar línea"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}
