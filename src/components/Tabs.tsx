import React from "react";
import "../styles/mf.css";

export function Tabs<T extends string>(props: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string }[];
}) {
  return (
    <div
      className="mf-card"
      style={{ padding: 8, display: "inline-flex", gap: 6 }}
    >
      {props.items.map((it) => (
        <button
          key={it.key}
          className="mf-btn"
          onClick={() => props.onChange(it.key)}
          style={{
            background:
              props.value === it.key ? "var(--mf-blue)" : "var(--mf-white)",
            color:
              props.value === it.key ? "var(--mf-white)" : "var(--mf-blue)",
            border:
              props.value === it.key
                ? "1px solid var(--mf-blue)"
                : "1px solid var(--mf-grey)",
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
