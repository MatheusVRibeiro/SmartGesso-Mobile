import { getApiClient } from './client';

export interface DashboardMetrics {
  toReceive: {
    total: number;
    count: number;
  };
  todayServices: {
    count: number;
  };
  recentQuotes: Array<{
    id: string;
    quoteNumber: number;
    version: number;
    status: string;
    total: number;
    createdAt: string;
    client: { id: string; name: string };
  }>;
  stockAlerts: Array<{
    id: string;
    name: string;
    unit: string;
    stockQty: number;
    minStockQty: number;
  }>;
}

async function api() {
  return getApiClient();
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const client = await api();
    const { data } = await client.get('/company/dashboard/metrics');
    return data;
  },
};