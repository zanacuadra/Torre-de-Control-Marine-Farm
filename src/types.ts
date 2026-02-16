/* =========================
   Shared Types (Single Source)
   ========================= */

/* ===== Audit Log (Bitácora) =====
   ✅ Compatible con tu implementación actual:
   { ts, module, by, message }
   y también soporta versión “avanzada” con entity/action/changes.
*/

export type AuditEntityType = "REQUEST" | "ORDER" | "SHIPMENT";

export type AuditEntry = {
  // ✅ mínimo usado hoy en tu código
  ts: string; // ISO datetime
  module: string; // e.g. "Solicitudes", "Pedidos", "Tránsito"
  by?: string; // user/role
  message: string; // texto visible en la bitácora

  // ✅ opcional: para evolución futura (no rompe nada)
  id?: string; // unique
  entityType?: AuditEntityType;
  entityId?: string; // requestId / orderId / shipmentId
  action?: string; // short code (CREATED/UPDATED/etc)
  note?: string; // extra note
  changes?: Record<string, { from?: any; to?: any }>;
};

/* ===== Shipments ===== */

export type DocsStatus = "PEND" | "DRAFT ENVIADO" | "OK";

export type Shipment = {
  id: string;
  orderId: string;

  // ✅ para mostrar PI real en Tránsito
  pi?: string;

  customer: string;
  country: string;
  destination: string;
  product: string;

  booking: string;
  etd: string; // ISO date
  eta: string; // ISO date

  docsStatus: DocsStatus;
  shippedKg: number;

  // ✅ Enriquecimiento (para Commercial KPI / Mix / Márgenes)
  specie?: "ATLANTIC" | "COHO" | "OTHER";
  market?: string;
  priceUsdPerKg?: number;
  marginUsdPerKg?: number;

  // ✅ Bitácora
  auditLog?: AuditEntry[];
};

/* ===== Orders (Backlog) ===== */

export type DelayReasonCode = "QC" | "RM" | "COM" | "BLOQ" | "PROD";

export type DelayOwner =
  | "QA / Calidad"
  | "Planning / Abastecimiento"
  | "Comercial / Key Account"
  | "Bodega / Inventarios"
  | "Producción / Planta";

export type BacklogOrder = {
  id: string;
  pi: string;
  customer: string;
  country: string;
  destination: string;
  product: string;
  plant: string;
  etd: string; // ISO yyyy-mm-dd

  // Nota UX: en este sistema lo usamos como “volumen cerrado / total orden”
  pendingKg: number;

  priceUsdPerKg: number;
  priority: number; // P1 = más alta
  commercial: string;

  // Shipping Instructions
  shippingConsignee?: string;
  shippingNotify?: string;
  shippingInstructionsOk?: boolean;

  // Delay tracking
  delayReasonCode?: DelayReasonCode;
  delayOwner?: DelayOwner;
  delayComment?: string;

  // ✅ Bitácora
  auditLog?: AuditEntry[];
};

/* ===== Requests (Order creation requests) ===== */

export type Certification = "N/A" | "ASC" | "BAP4" | "ABF";

export type OrderRequestItem = {
  id: string;

  product: string;
  quality: "Premium" | "Industrial A" | "Industrial B" | "Grado";
  size: string;

  price: { value: number; uom: "kg" | "lb" };
  volume: { value: number; uom: "kg" };
};

export type RequestStatus =
  | "BORRADOR"
  | "ENVIADA"
  | "EN_REVISION"
  | "OBSERVADA"
  | "RECHAZADA"
  | "PI CREADA"
  | "CREADA_EN_ERP";

export type ShippingInstructionsStatus = "OK" | "PEND" | "PENDIENTE";

export type OrderRequest = {
  id: string;

  createdAt: string; // ISO
  updatedAt: string; // ISO

  requester: string;

  client: string;
  consignee?: string;
  notify?: string;

  incoterm: "CFR" | "FOB" | "CIF";
  destination: string;
  shipmentEtdMonth: string; // YYYY-MM

  paymentMethod: string;

  certifications: Certification[];
  inspection: boolean;

  shippingInstructionsStatus: ShippingInstructionsStatus;

  additionalLabel: "YES" | "NO";
  additionalRequirements?: string;

  items: OrderRequestItem[];

  comments?: string;

  pi?: string;
  erp?: {
    pi?: string;
    ov?: string;
    despacho?: string;
  };

  status: RequestStatus;

  // ✅ Bitácora
  auditLog?: AuditEntry[];
};

/* ===== Global Filters ===== */

export type GlobalFilters = {
  customer?: string;
  product?: string;
  species?: string;
  caliber?: string;
  country?: string;
};

/* ===== Commercial KPI Targets ===== */

export type CommercialTargets = {
  targetsByMonth: Record<
    string,
    {
      ordersClosedTarget?: number;
      kgClosedTarget?: number;
      otifTargetPct?: number; // ej 95
    }
  >;
};
