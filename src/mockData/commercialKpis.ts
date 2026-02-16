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

export type ClaimRow = {
  id: string;
  customer: string;
  market: string;
  product: string;
  qtyKg: number;
  severity: "LOW" | "MED" | "HIGH";
  status: "OPEN" | "INVESTIGATING" | "CLOSED";
  openedDate: string;
};

export const claims: ClaimRow[] = [
  {
    id: "cl1",
    customer: 'LLC "UNIFROST"',
    market: "UEE",
    product: "Atlantic Frozen HON IQF 5–6",
    qtyKg: 15600,
    severity: "MED",
    status: "INVESTIGATING",
    openedDate: "2025-06-14",
  },
  {
    id: "cl2",
    customer: "Dongwon",
    market: "Korea",
    product: "Coho Frozen HON 10+",
    qtyKg: 8000,
    severity: "LOW",
    status: "OPEN",
    openedDate: "2025-07-03",
  },
  {
    id: "cl3",
    customer: "Minute Gourmet",
    market: "Philippines",
    product: "Atlantic Fillet Trim C",
    qtyKg: 5000,
    severity: "HIGH",
    status: "OPEN",
    openedDate: "2025-06-28",
  },
];

export type ForecastRow = {
  id: string;
  customer: string;
  country: string;
  month: string;
  forecastKg: number;
  forecastPrice: number; // solo precio
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
