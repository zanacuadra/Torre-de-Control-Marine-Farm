import React from "react";
import "../styles/mf.css";

export function KpiCard(props: {
  title: string; // "Pedidos Pendientes / Prioridades"
  value: string;
  subtitle?: string;
  tag?: { text: string; tone: "blue" | "orange" | "green" };
  onClick?: () => void;
}) {
  const parts = props.title.split("/");
  const mainTitle = parts[0]?.trim();
  const subTitle = parts.slice(1).join("/").trim();

  const toneClass =
    props.tag?.tone === "orange"
      ? "mf-pill-orange"
      : props.tag?.tone === "green"
      ? "mf-pill-green"
      : "mf-pill-blue";

  return (
    <div
      className="mf-card"
      onClick={props.onClick}
      style={{
        padding: 16,
        cursor: props.onClick ? "pointer" : "default",
        transition: "transform 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!props.onClick) return;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (!props.onClick) return;
        e.currentTarget.style.transform = "translateY(0px)";
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 17,
              color: "var(--mf-blue)",
              lineHeight: "20px",
            }}
          >
            {mainTitle}
          </div>

          {subTitle && (
            <div
              style={{
                fontSize: 13,
                color: "#5B848F",
                marginTop: 2,
              }}
            >
              {subTitle}
            </div>
          )}
        </div>

        {props.tag && (
          <span className={`mf-pill ${toneClass}`}>{props.tag.text}</span>
        )}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "var(--mf-blue)",
          marginTop: 12,
        }}
      >
        {props.value}
      </div>

      {props.subtitle && (
        <div style={{ fontSize: 12, marginTop: 6 }} className="mf-muted">
          {props.subtitle}
        </div>
      )}
    </div>
  );
}
