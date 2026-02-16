import React from "react";
import "../styles/mf.css";

export function SidePanel(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <>
      <div className="mf-overlay" onClick={props.onClose} />
      <div className="mf-drawer" role="dialog" aria-modal="true">
        <div className="mf-drawer-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{ fontWeight: 900, fontSize: 16, color: "var(--mf-blue)" }}
            >
              {props.title}
            </div>
            {props.subtitle && (
              <div className="mf-muted" style={{ fontSize: 12 }}>
                {props.subtitle}
              </div>
            )}
          </div>

          <button className="mf-btn mf-btn-secondary" onClick={props.onClose}>
            Cerrar
          </button>
        </div>

        <div className="mf-drawer-body">{props.children}</div>
      </div>
    </>
  );
}
