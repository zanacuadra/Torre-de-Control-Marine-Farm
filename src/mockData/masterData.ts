export type Species = "COHO" | "SALAR";

export const speciesOptions: Species[] = ["COHO", "SALAR"];

export const productOptions = [
  "HON",
  "HG",
  "TRIM A",
  "TRIM B",
  "TRIM C",
  "TRIM D",
  "TRIM E",
  "TRIM F",
  "BIT & PIECES",
];

export const boxTypeOptions = ["10 Kg", "25 Kg", "30 Kg"];

export const boxFormatOptions = ["Fijo", "Variable", "Fijo Varios Pesos"];

export const qualityOptions = [
  "Premium",
  "Grado",
  "Industrial A",
  "Industrial B",
];

export const caliberOptions = [
  "4-5",
  "5-6",
  "6-7",
  "7-8",
  "8-9",
  "9 lbs Up",
  "10 lbs Up",
];

// Aliases for easier imports
export const products = productOptions;
export const qualities = qualityOptions;
export const calibers = caliberOptions;
export const boxTypes = boxTypeOptions;
export const boxFormats = boxFormatOptions;

export const incotermOptions = ["CFR", "CIF", "FOB"];

export const paymentMethodOptions = [
  "Payment Agst. Docs.",
  "LC 60 days",
  "Advance 20% / Balance Docs",
  "TT in advance",
];

export const countries = [
  "VIETNAM",
  "CHINA",
  "KOREA",
  "PHILIPPINES",
  "THAILAND",
  "MALAYSIA",
  "SINGAPORE",
];
export const ports = [
  "HCMC",
  "HAI PHONG",
  "SHANGHAI",
  "QINGDAO",
  "BUSAN",
  "MANILA",
  "BANGKOK",
  "PORT KLANG",
  "SINGAPORE",
];

export const customers = [
  'LLC "UNIFROST"',
  "Malaysian Importer A",
  "Vietnam Importer B",
  "China Trading C",
  "Korea Seafood D",
  "Philippines Food E",
  "Thai Importer F",
  "Singapore Distributor G",
];

// helper: zero pad sin padStart
export function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

// helper: includes sin .includes (por lib antigua)
export function contains(hay: string, needle: string) {
  return hay.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
}
