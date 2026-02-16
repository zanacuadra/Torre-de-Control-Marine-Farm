import { backlogOrders, type BacklogOrder } from "../mockData/orders";

export async function getBacklogOrders(): Promise<BacklogOrder[]> {
  // hoy: mock
  return backlogOrders;
}
