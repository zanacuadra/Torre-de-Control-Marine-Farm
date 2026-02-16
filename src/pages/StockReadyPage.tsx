import React from "react";
import "../styles/mf.css";

const POWERBI_URL =
  "https://app.powerbi.com/groups/60ac0bdc-f1dd-4b1f-b31f-1003024d7cde/reports/5c0fe427-5f0f-41f6-bff9-54732aff26e9/ReportSection?experience=power-bi";

export function StockReadyPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="mf-card" style={{ padding: 16 }}>
        {/* ✅ Igual que headers de otras páginas: alignItems center */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{ fontWeight: 900, color: "var(--mf-blue)", fontSize: 16 }}
            >
              Stock Asignado / Pendiente Despacho
            </div>
            <div className="mf-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Power BI no permite embeber este reporte en la aplicación (bloqueo
              de seguridad). Ábrelo directamente en Power BI.
            </div>
          </div>

          {/* ✅ CTA idéntico a "Nuevo Pedido" */}
          <button
            className="mf-btn mf-btn-primary"
            onClick={() => window.open(POWERBI_URL, "_blank")}
          >
            Abrir en Power BI
          </button>
        </div>

        {/* Placeholder elegante (sin iframe roto) */}
        <div
          style={{
            marginTop: 14,
            height: "70vh",
            borderRadius: 12,
            border: "1px dashed rgba(0,0,0,0.18)",
            background: "rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <div
              style={{
                fontWeight: 900,
                color: "var(--mf-blue)",
                marginBottom: 8,
              }}
            >
              Embed bloqueado por Power BI
            </div>
            <div className="mf-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Este reporte requiere permisos/ajustes de “embedding” en el tenant
              de Microsoft (Power BI Embedded o habilitar “Allow embedding”).
              Por ahora, úsalo vía Power BI con el botón de arriba.
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="mf-btn mf-btn-secondary"
                onClick={() => window.open(POWERBI_URL, "_blank")}
              >
                Abrir reporte (nueva pestaña)
              </button>

              <button
                className="mf-btn mf-btn-secondary"
                onClick={() =>
                  alert(
                    "Para embeber: necesitas Power BI Embedded o habilitar 'Allow embedding' + permisos. Para el prototipo, el link es la opción segura."
                  )
                }
              >
                Ver requisito técnico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockReadyPage;
