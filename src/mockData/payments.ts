export type PendingInvoice = {
  id: string;
  invoiceNo: string;
  invoiceDate: string; // ISO YYYY-MM-DD
  amountUsd: number;
};

export type CustomerCreditStatus = {
  id: string;
  customer: string;
  market: string;
  debtUsd: number;
  insuranceUsd: number;
  invoices: PendingInvoice[];
};

export const paymentStatuses: CustomerCreditStatus[] = [
  {
    id: "c1",
    customer: 'LLC "UNIFROST"',
    market: "MERCADO_UNION_EUROASIATICA_UEE",
    debtUsd: 480_250,
    insuranceUsd: 350_000,
    invoices: [
      {
        id: "inv-uf-001",
        invoiceNo: "INV-UF-10021",
        invoiceDate: "2025-07-10",
        amountUsd: 120_120,
      },
      {
        id: "inv-uf-002",
        invoiceNo: "INV-UF-10045",
        invoiceDate: "2025-06-05",
        amountUsd: 210_500,
      },
      {
        id: "inv-uf-003",
        invoiceNo: "INV-UF-10089",
        invoiceDate: "2025-08-15",
        amountUsd: 149_630,
      },
    ],
  },
  {
    id: "c2",
    customer: "Minute Gourmet",
    market: "SEA",
    debtUsd: 220_900,
    insuranceUsd: 280_000,
    invoices: [
      {
        id: "inv-mg-001",
        invoiceNo: "INV-MG-7781",
        invoiceDate: "2025-08-01",
        amountUsd: 80_900,
      },
      {
        id: "inv-mg-002",
        invoiceNo: "INV-MG-7810",
        invoiceDate: "2025-07-05",
        amountUsd: 140_000,
      },
    ],
  },
  {
    id: "c3",
    customer: "Dongwon",
    market: "KOREA",
    debtUsd: 110_450,
    insuranceUsd: 200_000,
    invoices: [
      {
        id: "inv-dw-001",
        invoiceNo: "INV-DW-5503",
        invoiceDate: "2025-08-20",
        amountUsd: 65_450,
      },
      {
        id: "inv-dw-002",
        invoiceNo: "INV-DW-5531",
        invoiceDate: "2025-08-22",
        amountUsd: 45_000,
      },
    ],
  },
  {
    id: "c4",
    customer: "Moreodor - Russian Fish",
    market: "RUSSIA",
    debtUsd: 92_000,
    insuranceUsd: 120_000,
    invoices: [
      {
        id: "inv-mo-001",
        invoiceNo: "INV-MO-9090",
        invoiceDate: "2025-07-28",
        amountUsd: 92_000,
      },
    ],
  },
];
