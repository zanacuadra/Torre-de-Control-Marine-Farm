import React, { useMemo, useState } from "react";
import "./styles/mf.css";

import AppLayout from "./components/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import ShipmentsPage from "./pages/ShipmentsPage";

import { CommercialKpiPage } from "./pages/CommercialKpiPage";
import { CalculatorPage, type CalculatorContext } from "./pages/CalculatorPage";

import OrderRequestsPage from "./pages/OrderRequestsPage";

import { backlogOrders as backlogSeed } from "./mockData/orders";
import { shipments as shipmentsSeed } from "./mockData/shipments";
import { orderRequestsSeed } from "./mockData/orderRequests";

import type { BacklogOrder, Shipment, OrderRequest } from "./types";

/* =======================
   LocalStorage keys
======================= */
const LS_ORDERS_KEY = "mf.orders.v1";
const LS_REQUESTS_KEY = "mf.requests.v1";

/* =======================
   Helpers
======================= */

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function etaDays(etaIso?: string) {
  if (!etaIso) return null;
  const today = startOfToday();
  const eta = new Date(etaIso);
  if (Number.isNaN(eta.getTime())) return null;
  eta.setHours(0, 0, 0, 0);
  return daysBetween(today, eta);
}

function monthToIsoDate(yyyyMm: string) {
  const parts = yyyyMm.split("-");
  const y = parts[0] || "2025";
  const m = parts[1] || "01";
  const mm = ("0" + m).slice(-2);
  return `${y}-${mm}-01`;
}

function priceToUsdKg(value: number, uom: "kg" | "lb") {
  return uom === "kg" ? value : value * 2.20462262;
}

function sumVolumeKg(req: OrderRequest) {
  return req.items.reduce((a, it) => a + (it.volume?.value || 0), 0);
}

function weightedAvgPriceUsdKg(req: OrderRequest) {
  const totalKg = sumVolumeKg(req);
  if (!totalKg) return 0;
  let acc = 0;
  for (const it of req.items) {
    acc += priceToUsdKg(it.price.value, it.price.uom) * it.volume.value;
  }
  return acc / totalKg;
}

function guessCountry(destination: string) {
  const d = destination.toLowerCase();
  if (d.includes("vietnam")) return "VIETNAM";
  if (d.includes("china")) return "CHINA";
  if (d.includes("brazil")) return "BRAZIL";
  if (d.includes("russia")) return "RUSSIA";
  if (d.includes("korea")) return "KOREA";
  if (d.includes("philippines")) return "PHILIPPINES";
  if (d.includes("thailand")) return "THAILAND";
  if (d.includes("malaysia")) return "MALAYSIA";
  if (d.includes("singapore")) return "SINGAPORE";
  return "OTRO";
}

function isShippingOk(consignee?: string, notify?: string) {
  return Boolean((consignee || "").trim()) && Boolean((notify || "").trim());
}

/* =======================
   Filtro helpers
======================= */

function norm(s?: string) {
  return (s || "").toLowerCase().trim();
}

function includesFilter(field: string | undefined, filter: string | undefined) {
  const f = norm(filter);
  if (!f) return true;
  return norm(field).includes(f);
}

/* =======================
   Navegación
======================= */

export type PageKey =
  | "dashboard"
  | "orders"
  | "requests"
  | "shipments"
  | "commercialKpi"
  | "calculator";

/* =======================
   Filtros globales
======================= */

export type GlobalFilters = {
  customer?: string;
  product?: string;
  species?: string;
  caliber?: string;
  country?: string;
};

/* =======================
   Tipos internos
======================= */

export type DeliveredRecord = Shipment & { deliveredAt: string };

/* =======================
   LocalStorage safe helpers
======================= */

function loadLsArray<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as T[];
  } catch {
    return null;
  }
}

function saveLs<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/* =======================
   App
======================= */

export default function App() {
  const [page, setPage] = useState<PageKey>("dashboard");

  // ✅ Hydrate inicial desde localStorage (si existe), si no seed
  const [orders, setOrders] = useState<BacklogOrder[]>(() => {
    const ls = loadLsArray<BacklogOrder>(LS_ORDERS_KEY);
    return ls && ls.length ? ls : backlogSeed;
  });

  const [shipments, setShipments] = useState<Shipment[]>(shipmentsSeed);
  const [delivered, setDelivered] = useState<DeliveredRecord[]>([]);

  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>(() => {
    const ls = loadLsArray<OrderRequest>(LS_REQUESTS_KEY);
    return ls && ls.length ? ls : orderRequestsSeed;
  });

  const [calcCtx, setCalcCtx] = useState<CalculatorContext>(
    {} as CalculatorContext
  );

  // ✅ Global Filters en header (AppLayout)
  const [filters, setFilters] = useState<GlobalFilters>({
    customer: "",
    product: "",
    species: "",
    caliber: "",
    country: "",
  });

  function goTo(p: PageKey) {
    setPage(p);
  }

  function openCalculator(ctx: CalculatorContext) {
    setCalcCtx(ctx);
    setPage("calculator");
  }

  function closeCalculator() {
    setPage("orders");
  }

  // ✅ Persistencia centralizada
  function setOrdersAndPersist(
    next: BacklogOrder[] | ((prev: BacklogOrder[]) => BacklogOrder[])
  ) {
    setOrders((prev) => {
      const computed = typeof next === "function" ? (next as any)(prev) : next;
      saveLs(LS_ORDERS_KEY, computed);
      return computed;
    });
  }

  function setRequestsAndPersist(
    next: OrderRequest[] | ((prev: OrderRequest[]) => OrderRequest[])
  ) {
    setOrderRequests((prev) => {
      const computed = typeof next === "function" ? (next as any)(prev) : next;
      saveLs(LS_REQUESTS_KEY, computed);
      return computed;
    });
  }

  function moveOrderToTransit(orderId: string, shipment: Shipment) {
    setOrdersAndPersist((prev) => prev.filter((o) => o.id !== orderId));
    setShipments((prev) => [shipment, ...prev]);
    setPage("shipments");
  }

  function createBacklogOrderFromRequest(req: OrderRequest) {
    const totalKg = sumVolumeKg(req);
    const avgPrice = weightedAvgPriceUsdKg(req);
    const etd = monthToIsoDate(req.shipmentEtdMonth);

    const productSummary =
      req.items.length === 1
        ? `${req.items[0].product} (${req.items[0].size})`
        : `MIX (${req.items.length} líneas)`;

    const newOrder: BacklogOrder = {
      id: `ORD-${req.id}`,
      pi: req.pi || `PI-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: req.client,
      country: guessCountry(req.destination),
      destination: `${req.incoterm} ${req.destination}`,
      product: productSummary,
      plant: "QUELLON 10751",
      etd,
      pendingKg: totalKg || 0,
      priceUsdPerKg: avgPrice || 0,
      priority: 3,
      commercial: req.requester,

      // ✅ Shipping Instructions viajan a Pedidos
      shippingConsignee: req.consignee || "",
      shippingNotify: req.notify || "",
      shippingInstructionsOk: isShippingOk(req.consignee, req.notify),
    };

    // ✅ Importante: persistimos antes de navegar
    setOrdersAndPersist((prev) => {
      const exists = prev.some((o) => o.id === newOrder.id);
      if (exists) return prev;
      return [newOrder, ...prev];
    });

    setPage("orders");
  }

  function confirmDelivered(shipmentId: string) {
    setShipments((prev) => {
      const target = prev.find((s) => String(s.id) === String(shipmentId));
      if (target) {
        setDelivered((dprev) => [
          { ...target, deliveredAt: new Date().toISOString() },
          ...dprev,
        ]);
      }
      return prev.filter((s) => String(s.id) !== String(shipmentId));
    });
  }

  // ✅ KPI Comercial: órdenes cerradas del mes (desde delivered[])
  const closedThisMonth = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return delivered.filter((d) => {
      const dt = new Date(d.deliveredAt);
      return dt.getFullYear() === y && dt.getMonth() === m;
    }).length;
  }, [delivered]);

  /* =======================
     ✅ FILTRADO GLOBAL
     - Filtra en todos los módulos
  ======================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!includesFilter(o.customer, filters.customer)) return false;
      if (!includesFilter(o.product, filters.product)) return false;
      if (!includesFilter(o.country, filters.country)) return false;

      // species/caliber mock: buscamos dentro del texto de producto
      if (!includesFilter(o.product, filters.species)) return false;
      if (!includesFilter(o.product, filters.caliber)) return false;

      return true;
    });
  }, [orders, filters]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (!includesFilter(s.customer, filters.customer)) return false;
      if (!includesFilter(s.product, filters.product)) return false;
      if (!includesFilter(s.country, filters.country)) return false;
      if (!includesFilter(s.product, filters.species)) return false;
      if (!includesFilter(s.product, filters.caliber)) return false;
      return true;
    });
  }, [shipments, filters]);

  const filteredRequests = useMemo(() => {
    return orderRequests.filter((r) => {
      if (!includesFilter(r.client, filters.customer)) return false;

      if (norm(filters.country)) {
        const hay =
          includesFilter(r.destination, filters.country) ||
          includesFilter(`${r.incoterm} ${r.destination}`, filters.country);
        if (!hay) return false;
      }

      const itemsText = r.items
        .map((it) => `${it.product} ${it.size} ${it.quality}`)
        .join(" | ");

      if (!includesFilter(itemsText, filters.product)) return false;
      if (!includesFilter(itemsText, filters.species)) return false;
      if (!includesFilter(itemsText, filters.caliber)) return false;

      return true;
    });
  }, [orderRequests, filters]);

  const etaTodayFiltered = useMemo(() => {
    return filteredShipments.filter((s) => etaDays(s.eta) === 0);
  }, [filteredShipments]);

  const content = useMemo(() => {
    switch (page) {
      case "dashboard":
        return (
          <DashboardPage
            goTo={goTo}
            orders={filteredOrders}
            shipments={filteredShipments}
            etaToday={etaTodayFiltered}
            onConfirmDelivered={confirmDelivered}
            closedThisMonth={closedThisMonth}
          />
        );

      case "orders":
        return (
          <OrdersPage
            orders={filteredOrders}
            setOrders={setOrdersAndPersist}
            openCalculator={openCalculator}
            moveOrderToTransit={moveOrderToTransit}
            goToRequests={() => goTo("requests")}
          />
        );

      case "requests":
        return (
          <OrderRequestsPage
            requests={filteredRequests}
            setRequests={setRequestsAndPersist}
            createBacklogOrderFromRequest={createBacklogOrderFromRequest}
          />
        );

      case "shipments":
        return (
          <ShipmentsPage
            shipments={filteredShipments}
            setShipments={setShipments}
            onConfirmDelivered={confirmDelivered}
          />
        );

      case "commercialKpi":
        return (
          <CommercialKpiPage delivered={delivered} shipments={shipments} />
        );

      case "calculator":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="mf-card"
              style={{
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div className="mf-h1">Calculadora</div>
                <div
                  className="mf-muted"
                  style={{ marginTop: 6, fontSize: 13 }}
                >
                  Vista calculadora (mock).
                </div>
              </div>
              <button
                className="mf-btn mf-btn-secondary"
                onClick={closeCalculator}
              >
                Volver
              </button>
            </div>

            <CalculatorPage ctx={calcCtx} />
          </div>
        );

      default:
        return (
          <DashboardPage
            goTo={goTo}
            orders={filteredOrders}
            shipments={filteredShipments}
            etaToday={etaTodayFiltered}
            onConfirmDelivered={confirmDelivered}
            closedThisMonth={closedThisMonth}
          />
        );
    }
  }, [
    page,
    filteredOrders,
    filteredShipments,
    filteredRequests,
    etaTodayFiltered,
    calcCtx,
    closedThisMonth,
    delivered,
    shipments,
  ]);

  function resetDemo() {
    saveLs(LS_ORDERS_KEY, backlogSeed);
    saveLs(LS_REQUESTS_KEY, orderRequestsSeed);

    setOrders(backlogSeed);
    setShipments(shipmentsSeed);
    setDelivered([]);
    setOrderRequests(orderRequestsSeed);

    setFilters({
      customer: "",
      product: "",
      species: "",
      caliber: "",
      country: "",
    });

    setPage("dashboard");
  }

  return (
    <AppLayout
      current={page}
      onNavigate={goTo}
      filters={filters}
      setFilters={setFilters}
      onResetDemo={resetDemo}
    >
      {content}
    </AppLayout>
  );
}
