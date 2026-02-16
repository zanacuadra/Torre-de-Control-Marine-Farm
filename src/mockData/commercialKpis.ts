import type { ClaimRow, ClaimStatus } from "../types";

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

export const claims: ClaimRow[] = [
  {
    id: "CL-001",
    customer: 'LLC "UNIFROST"',
    market: "UEE",
    product: "Atlantic Frozen HON IQF 5–6",
    qtyKg: 15600,
    severity: "MED",
    status: "PENDIENTE RESPUESTA",
    openedAt: "2025-06-14",
    glosa: "Cliente reporta calidad inferior en lote 45623. Peces con escamas y manchas marrones en algunos filetes.",
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
    openedAt: "2025-07-03",
    glosa: "Embalaje presenta daños menores en 3 pallets. Solicitan inspección fotográfica.",
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
    openedAt: "2025-06-28",
    glosa: "Temperatura fuera de rango durante transporte. Container llegó a 2°C por encima del límite especificado.",
    receivedDate: "2025-06-29",
    responsiblePerson: "Roberto Silva",
  },
  {
    id: "CL-004",
    customer: 'LLC "UNIFROST"',
    market: "UEE",
    product: "Coho Frozen Portions",
    qtyKg: 12000,
    severity: "LOW",
    status: "OK",
    openedAt: "2025-05-10",
    glosa: "Etiquetado incorrecto en 2 pallets (falta fecha de producción).",
    receivedDate: "2025-05-11",
    responsiblePerson: "Carlos Mendoza",
    closeReason: "Se envió corrección de etiquetas y declaración jurada de fechas de producción correctas. Cliente aceptó solución.",
    creditNote: "NO",
    closedDate: "2025-05-18",
  },
  {
    id: "CL-005",
    customer: "Moreodor",
    market: "Russia",
    product: "Atlantic Frozen HON 6-7",
    qtyKg: 18500,
    severity: "MED",
    status: "OK",
    openedAt: "2025-04-22",
    glosa: "Desviación de calibre en 15% del lote. Cliente solicita compensación.",
    receivedDate: "2025-04-23",
    responsiblePerson: "Ana Fernández",
    closeReason: "Se acordó descuento del 8% por desviación de calibre. Cliente satisfecho con compensación.",
    creditNote: "SI",
    creditNoteAmount: 11840,
    closedDate: "2025-05-02",
  },
];

export type ForecastRow = {
  id: string;
  customer: string;
  market: string;
  month: string;
  forecastKg: number;
  avgPriceUsdPerKg: number;
  confidence: "LOW" | "MED" | "HIGH";
};

export const forecastByCustomer: ForecastRow[] = [
  {
    id: "f1",
    customer: 'LLC "UNIFROST"',
    market: "Russia",
    month: "2025-08",
    forecastKg: 180000,
    avgPriceUsdPerKg: 7.75,
    confidence: "HIGH",
  },
  {
    id: "f2",
    customer: "Moreodor",
    market: "Russia",
    month: "2025-08",
    forecastKg: 120000,
    avgPriceUsdPerKg: 7.65,
    confidence: "MED",
  },
  {
    id: "f3",
    customer: "Dongwon",
    market: "Korea",
    month: "2025-08",
    forecastKg: 95000,
    avgPriceUsdPerKg: 6.35,
    confidence: "MED",
  },
  {
    id: "f4",
    customer: "Minute Gourmet",
    market: "Philippines",
    month: "2025-08",
    forecastKg: 70000,
    avgPriceUsdPerKg: 7.1,
    confidence: "LOW",
  },
];
