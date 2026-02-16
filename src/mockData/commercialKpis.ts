export type PeriodKey = "2025-05" | "2025-06" | "2025-07";

export const commercialSummaryByMonth: Record<
  PeriodKey,
  {
    activeCustomers: number;
    openedCustomers: number;
    monthlyVolumeKg: number;
    avgPriceVsMarket: { ourAvg: number; marketAvg: number; index: number };
    visits: number;
    claimsOpen: number;
    claimsResolved: number;
  }
> = {
  "2025-05": {
    activeCustomers: 18,
    openedCustomers: 4,
    monthlyVolumeKg: 1185000,
    avgPriceVsMarket: { ourAvg: 7.62, marketAvg: 7.48, index: 1.019 },
    visits: 26,
    claimsOpen: 5,
    claimsResolved: 9,
  },
  "2025-06": {
    activeCustomers: 21,
    openedCustomers: 6,
    monthlyVolumeKg: 1320000,
    avgPriceVsMarket: { ourAvg: 7.55, marketAvg: 7.6, index: 0.993 },
    visits: 34,
    claimsOpen: 7,
    claimsResolved: 11,
  },
  "2025-07": {
    activeCustomers: 20,
    openedCustomers: 3,
    monthlyVolumeKg: 1243000,
    avgPriceVsMarket: { ourAvg: 7.7, marketAvg: 7.66, index: 1.005 },
    visits: 29,
    claimsOpen: 6,
    claimsResolved: 8,
  },
};

export type ClaimStatus = "PENDIENTE ENVÍO" | "PENDIENTE RESPUESTA" | "OK";

export type ClaimRow = {
  id: string;
  customer: string;
  market: string;
  product: string;
  qtyKg: number;
  severity: "LOW" | "MED" | "HIGH";
  status: ClaimStatus;
  openedDate: string;
  description?: string;
  receivedDate?: string;
  responsiblePerson?: string;
  closeReason?: string;
  creditNote?: boolean;
  creditNoteAmount?: number;
  closedDate?: string;
};

export const claims: ClaimRow[] = [
  {
    id: "CL-001",
    customer: 'LLC "UNIFROST"',
    market: "UEE",
    product: "Atlantic Frozen HON IQF 5–6",
    qtyKg: 15600,
    severity: "MED",
    status: "PENDIENTE RESPUESTA",
    openedDate: "2025-06-14",
    description: "Cliente reporta calidad inferior en lote 45623. Peces con escamas y manchas marrones en algunos filetes.",
    receivedDate: "2025-06-15",
    responsiblePerson: "Carlos Mendoza",
  },
  {
    id: "CL-002",
    customer: "Dongwon",
    market: "Korea",
    product: "Coho Frozen HON 10+",
    qtyKg: 8000,
    severity: "LOW",
    status: "PENDIENTE ENVÍO",
    openedDate: "2025-07-03",
    description: "Embalaje presenta daños menores en 3 pallets. Solicitan inspección fotográfica.",
    receivedDate: "2025-07-04",
    responsiblePerson: "Ana Fernández",
  },
  {
    id: "CL-003",
    customer: "Minute Gourmet",
    market: "Philippines",
    product: "Atlantic Fillet Trim C",
    qtyKg: 5000,
    severity: "HIGH",
    status: "PENDIENTE RESPUESTA",
    openedDate: "2025-06-28",
    description: "Temperatura fuera de rango durante transporte. Container llegó a 2°C por encima del límite especificado.",
    receivedDate: "2025-06-29",
    responsiblePerson: "Roberto Silva",
  },
  {
    id: "CL-004",
    customer: "Seafood Global Co.",
    market: "Vietnam",
    product: "Coho HG IQF 8-9 lbs",
    qtyKg: 12000,
    severity: "LOW",
    status: "OK",
    openedDate: "2025-05-10",
    description: "Cliente reportó pesos variables en algunas cajas. Solicitó verificación de peso neto.",
    receivedDate: "2025-05-11",
    responsiblePerson: "María López",
    closeReason: "Se verificaron los pesos y están dentro del rango aceptable (+/- 2%). Cliente aceptó explicación técnica.",
    creditNote: false,
    closedDate: "2025-05-18",
  },
  {
    id: "CL-005",
    customer: "Thai Foods Ltd",
    market: "Thailand",
    product: "Atlantic HON 6-7",
    qtyKg: 18500,
    severity: "MED",
    status: "OK",
    openedDate: "2025-06-01",
    description: "Reclamo por calibre inconsistente. 15% del lote con calibre fuera de especificación.",
    receivedDate: "2025-06-02",
    responsiblePerson: "Carlos Mendoza",
    closeReason: "Se confirmó error en clasificación. Se ofreció nota de crédito por el 10% del valor del lote afectado como compensación.",
    creditNote: true,
    creditNoteAmount: 8500,
    closedDate: "2025-06-12",
  },
];

export type ForecastRow = {
  id: string;
  customer: string;
  country: string;
  month: string;
  forecastKg: number;
  forecastPrice: number;
  confidence: "LOW" | "MED" | "HIGH";
};

export const forecastByCustomer: ForecastRow[] = [
  {
    id: "f1",
    customer: 'LLC "UNIFROST"',
    country: "Russia",
    month: "2025-08",
    forecastKg: 180000,
    forecastPrice: 7.75,
    confidence: "HIGH",
  },
  {
    id: "f2",
    customer: "Moreodor",
    country: "Russia",
    month: "2025-08",
    forecastKg: 120000,
    forecastPrice: 7.65,
    confidence: "MED",
  },
  {
    id: "f3",
    customer: "Dongwon",
    country: "Korea",
    month: "2025-08",
    forecastKg: 95000,
    forecastPrice: 6.35,
    confidence: "MED",
  },
  {
    id: "f4",
    customer: "Minute Gourmet",
    country: "Philippines",
    month: "2025-08",
    forecastKg: 70000,
    forecastPrice: 7.1,
    confidence: "LOW",
  },
];
