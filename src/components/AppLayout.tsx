import React from "react";
import "../styles/mf.css";
import type { PageKey } from "../App";

type Props = {
  current: PageKey;
  onNavigate: (p: PageKey) => void;

  // filtros globales (si ya los tienes en tu App)
  filters?: {
    customer?: string;
    product?: string;
    species?: string;
    caliber?: string;
    country?: string;
  };
  setFilters?: React.Dispatch<
    React.SetStateAction<{
      customer?: string;
      product?: string;
      species?: string;
      caliber?: string;
      country?: string;
    }>
  >;

  // ✅ ahora es opcional
  onResetDemo?: () => void;

  children: React.ReactNode;
};

type NavItem = {
  key: PageKey;
  labelTop: string;
  labelBottom?: string;
};

const NAV: NavItem[] = [
  { key: "dashboard", labelTop: "Dashboard" },
  {
    key: "requests",
    labelTop: "Solicitudes",
    labelBottom: "Creación de Orden",
  },
  { key: "orders", labelTop: "Pedidos", labelBottom: "Prioridades" },
  { key: "shipments", labelTop: "Tránsito", labelBottom: "Docs / ETD-ETA" },
  { key: "commercialKpi", labelTop: "Comercial", labelBottom: "KPI" },
  { key: "calculator", labelTop: "Calculadora" },
];

export default function AppLayout(props: Props) {
  const { current, onNavigate, children, filters, setFilters, onResetDemo } =
    props;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--mf-grey-light)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "var(--mf-blue)",
          color: "white",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Logo blanco */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <img
            src="/logo-white.png"
            alt="Marine Farm"
            style={{ width: 120, height: "auto" }}
          />
          <div
            style={{
              fontSize: 12,
              opacity: 0.9,
              lineHeight: 1.2,
              maxWidth: 210,
            }}
          >
            Inspired by nature, driven by people
          </div>
        </div>

        <div style={{ height: 8 }} />

        {/* Navegación */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {NAV.map((it) => {
            const active = it.key === current;
            const isDashboard = it.key === "dashboard";

            return (
              <button
                key={it.key}
                onClick={() => onNavigate(it.key)}
                style={{
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 12,
                  padding: isDashboard ? "14px 14px" : "10px 12px",
                  background: active ? "rgba(255,255,255,0.16)" : "transparent",
                  color: "white",
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: isDashboard ? 18 : 14,
                    lineHeight: 1.1,
                  }}
                >
                  {it.labelTop}
                </div>
                {it.labelBottom ? (
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                    {it.labelBottom}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Reset Demo */}
        {onResetDemo ? (
          <button
            className="mf-btn mf-btn-secondary"
            style={{ width: "100%" }}
            onClick={onResetDemo}
          >
            Reset Demo
          </button>
        ) : null}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 18 }}>
        {/* Filtros globales */}
        {filters && setFilters ? (
          <div
            className="mf-card"
            style={{
              padding: 14,
              marginBottom: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: 10,
              alignItems: "end",
            }}
          >
            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                Cliente
              </div>
              <input
                value={filters.customer || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, customer: e.target.value }))
                }
                placeholder="Ej: Unifrost"
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              />
            </div>

            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                Producto
              </div>
              <input
                value={filters.product || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, product: e.target.value }))
                }
                placeholder="Ej: HON / Coho HG"
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              />
            </div>

            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                Especie
              </div>
              <input
                value={filters.species || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, species: e.target.value }))
                }
                placeholder="Ej: ATLANTICO"
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              />
            </div>

            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                Calibre
              </div>
              <input
                value={filters.caliber || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, caliber: e.target.value }))
                }
                placeholder="Ej: 6-7 / 9 lbs up"
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              />
            </div>

            <div>
              <div className="mf-muted" style={{ fontSize: 12 }}>
                País
              </div>
              <input
                value={filters.country || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, country: e.target.value }))
                }
                placeholder="Ej: VIETNAM"
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              />
            </div>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}
