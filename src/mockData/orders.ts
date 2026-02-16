// src/mockData/orders.ts
import type { BacklogOrder } from "../types";

function isOk(consignee?: string, notify?: string) {
  return Boolean((consignee || "").trim()) && Boolean((notify || "").trim());
}

export const backlogOrders: BacklogOrder[] = [
  {
    id: "ORD-1001",
    pi: "PI-23561",
    customer: 'LLC "UNIFROST"',
    country: "RUSSIA",
    destination: "CFR ST. PETERSBURG - RUSSIA",
    product: "ATLANTIC FROZEN HON IQF (5-6 / 6-7 MIX)",
    plant: "QUELLON 10751",
    etd: "2026-02-01",
    pendingKg: 15600,
    priceUsdPerKg: 7.7,
    priority: 1,
    commercial: "NICOLAS CUADRA",
    shippingConsignee: "LLC UNIFROST, St Petersburg",
    shippingNotify: "Artem Surovtcev",
    shippingInstructionsOk: true,
  },
  {
    id: "ORD-1002",
    pi: "PI-3008",
    customer: "Malaysia Importer A",
    country: "MALAYSIA",
    destination: "CFR Port Klang, Malaysia",
    product: "COHO HG IQF (9 lbs Up)",
    plant: "QUELLON 10751",
    etd: "2026-01-15",
    pendingKg: 20000,
    priceUsdPerKg: 6.8,
    priority: 2,
    commercial: "NICOLAS CUADRA",
    shippingConsignee: "",
    shippingNotify: "",
    shippingInstructionsOk: false,
  },
  {
    id: "ORD-1003",
    pi: "PI-44112",
    customer: "Minute Gourmet",
    country: "PHILIPPINES",
    destination: "CFR Manila, Philippines",
    product: "ATLANTIC HON IQF (6-7)",
    plant: "QUELLON 10751",
    etd: "2026-03-10",
    pendingKg: 18000,
    priceUsdPerKg: 7.4,
    priority: 3,
    commercial: "NICOLAS CUADRA",
    shippingConsignee: "Minute Gourmet Inc.",
    shippingNotify: "",
    shippingInstructionsOk: false,
  },
].map((o) => ({
  ...o,
  shippingInstructionsOk: isOk(o.shippingConsignee, o.shippingNotify),
}));
