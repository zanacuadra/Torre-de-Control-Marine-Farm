export type StockReadyItem = {
  id: string;
  pi: string;
  customer: string;
  product: string;
  plant: string;
  readyKg: number;
  etdVessel: string;
  docsComplete: boolean;
  status: "READY" | "PENDING_DOCS";
};

export const stockReady: StockReadyItem[] = [
  {
    id: "sr1",
    pi: "23561",
    customer: 'LLC "UNIFROST"',
    product: "Atlantic Frozen HON IQF 5–6",
    plant: "Quellón",
    readyKg: 15600,
    etdVessel: "2025-06-03",
    docsComplete: true,
    status: "READY",
  },
  {
    id: "sr2",
    pi: "23562",
    customer: 'LLC "UNIFROST"',
    product: "Atlantic Frozen HON IQF 6–7",
    plant: "Quellón",
    readyKg: 3900,
    etdVessel: "2025-06-03",
    docsComplete: false,
    status: "PENDING_DOCS",
  },
];
